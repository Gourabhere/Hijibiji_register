'use server';

import { google } from 'googleapis';
import type { FlatData } from '@/components/dashboard/dashboard-client';


const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const RANGE = 'Sheet1'; // Assumes data is on 'Sheet1'. Change if needed.

const getSheetsApi = () => {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        throw new Error('Google Sheets API credentials are not set in environment variables. Please create a .env.local file and add your credentials.');
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth });
};

const mapRowToFlatData = (row: any[]): FlatData => {
    return {
        ownerName: row[4] || '',
        contactNumber: row[5] || '',
        email: row[6] || '',
        familyMembers: row[7] || '',
        issues: row[8] || '',
        maintenanceStatus: row[9] || 'pending',
        registered: row[10] === 'TRUE',
        lastUpdated: row[11] || '',
    };
};

export async function getFlatsData(): Promise<Record<string, FlatData>> {
    if (!SPREADSHEET_ID) {
        throw new Error("The GOOGLE_SHEET_ID is not configured. Please set it up in your .env.local file. You can find instructions in src/app/actions.ts.");
    }

    try {
        const sheets = getSheetsApi();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = response.data.values;
        if (!rows || rows.length < 2) { // Need at least a header and one data row
            console.log("Sheet is empty or only has a header row.");
            return {};
        }

        const headerRow = rows[0];
        if (!headerRow.includes('Registered')) {
            throw new Error("Your Google Sheet is missing the 'Registered' column, which is required. Please add it after 'Maintenance Status'. The expected columns are: Flat ID, Block, Floor, Flat, Owner Name, Contact Number, Email, Family Members, Issues / Complaints, Maintenance Status, Registered, Last Updated, Password.");
        }

        const flatData: Record<string, FlatData> = {};
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const flatId = row[0];
            if (flatId) {
                flatData[flatId] = mapRowToFlatData(row);
            }
        }
        return flatData;
    } catch (e: any) {
        console.error("Failed to load flat data from Google Sheets.", e);
        if (e.message.includes('permission') || e.message.includes('Permission denied')) {
             throw new Error("Could not connect to Google Sheets. Please ensure you have shared your sheet with the service account's email address and that the Sheets API is enabled.");
        }
        if (e.message.includes('Requested entity was not found')) {
            throw new Error(`Could not find the Google Sheet. Please make sure the GOOGLE_SHEET_ID in your .env.local file is correct and the range ('${RANGE}') exists.`);
        }
        // Re-throw specific errors
        if (e.message.includes("missing the 'Registered' column")) {
            throw e;
        }
        throw new Error("Could not connect to Google Sheets. Please ensure your configuration in .env.local is correct and the service account has permission.");
    }
}


export async function saveFlatDataAction(flatId: string, data: FlatData): Promise<void> {
    if (!SPREADSHEET_ID) {
        throw new Error("GOOGLE_SHEET_ID environment variable not set.");
    }
    
    try {
        const sheets = getSheetsApi();
        const getResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = getResponse.data.values;
        if (!rows) {
            throw new Error("Sheet is empty or could not be read.");
        }

        const headerRow = rows[0];
        if (!headerRow.includes('Registered')) {
            throw new Error("Your Google Sheet is missing the 'Registered' column, which is required for the app to function correctly.");
        }
        const passwordIndex = headerRow.indexOf('Password');


        const rowIndex = rows.findIndex(row => row[0] === flatId);
        
        const updatedDataWithTimestamp = { ...data, lastUpdated: new Date().toISOString() };
        
        const [block, floorAndFlat] = flatId.split('-');
        const floor = floorAndFlat.match(/\d+/)?.[0] || '';
        const flat = floorAndFlat.match(/[A-Z]/)?.[0] || '';

        const rowData = [
            flatId,
            block,
            floor,
            flat,
            updatedDataWithTimestamp.ownerName,
            updatedDataWithTimestamp.contactNumber,
            updatedDataWithTimestamp.email,
            updatedDataWithTimestamp.familyMembers,
            updatedDataWithTimestamp.issues,
            updatedDataWithTimestamp.maintenanceStatus,
            updatedDataWithTimestamp.registered ? 'TRUE' : 'FALSE',
            updatedDataWithTimestamp.lastUpdated
        ];

        if (rowIndex > 0) {
             // Preserve existing password if it exists
            if (passwordIndex !== -1 && rows[rowIndex][passwordIndex]) {
                rowData[passwordIndex] = rows[rowIndex][passwordIndex];
            }
            const updateRange = `${RANGE}!A${rowIndex + 1}`;
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: updateRange,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [rowData],
                },
            });
        } else {
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: RANGE,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [rowData],
                },
            });
        }
    } catch(e: any) {
        console.error("Failed to save flat data to Google Sheets.", e);
        throw new Error(e.message || "Failed to save data. Please check your Google Sheets configuration and permissions.");
    }
}

export async function loginOwnerAction(flatId: string, password_from_user: string): Promise<{ success: boolean; message: string }> {
    if (!SPREADSHEET_ID) {
        return { success: false, message: "GOOGLE_SHEET_ID environment variable not set." };
    }
    
    try {
        const sheets = getSheetsApi();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = response.data.values;
        if (!rows || rows.length < 2) {
            return { success: false, message: "No data found in the sheet." };
        }

        const headerRow = rows[0];
        const flatIdIndex = headerRow.indexOf('Flat ID');
        const passwordIndex = headerRow.indexOf('Password');

        if (flatIdIndex === -1 || passwordIndex === -1) {
            return { success: false, message: "Sheet is missing 'Flat ID' or 'Password' column." };
        }
        
        const ownerRow = rows.slice(1).find(row => row[flatIdIndex] === flatId);

        if (!ownerRow) {
            return { success: false, message: "Flat ID not found." };
        }

        const correctPassword = ownerRow[passwordIndex];
        if (correctPassword === password_from_user) {
            return { success: true, message: "Login successful." };
        } else {
            return { success: false, message: "Incorrect password." };
        }
    } catch (e: any) {
        console.error("Owner login failed.", e);
        return { success: false, message: "An error occurred during login. Please check server logs." };
    }
}

export type OwnerFlatData = FlatData & {
    flatId: string;
    block: string;
    floor: string;
    flat: string;
};

export async function getOwnerFlatData(flatId: string): Promise<OwnerFlatData | null> {
    if (!SPREADSHEET_ID) {
        throw new Error("GOOGLE_SHEET_ID environment variable not set.");
    }

    try {
        const sheets = getSheetsApi();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const rows = response.data.values;
        if (!rows || rows.length < 2) {
            return null;
        }
        
        const headerRow = rows[0];
        const flatIdIndex = headerRow.indexOf('Flat ID');

        if (flatIdIndex === -1) {
             throw new Error("Sheet is missing 'Flat ID' column.");
        }

        const ownerRow = rows.slice(1).find(row => row[flatIdIndex] === flatId);
        
        if (!ownerRow) {
            return null;
        }

        return {
            flatId: ownerRow[0] || '',
            block: ownerRow[1] || '',
            floor: ownerRow[2] || '',
            flat: ownerRow[3] || '',
            ownerName: ownerRow[4] || '',
            contactNumber: ownerRow[5] || '',
            email: ownerRow[6] || '',
            familyMembers: ownerRow[7] || '',
            issues: ownerRow[8] || '',
            maintenanceStatus: ownerRow[9] || 'pending',
            registered: ownerRow[10] === 'TRUE',
            lastUpdated: ownerRow[11] || '',
        };
    } catch(e: any) {
        console.error("Failed to fetch owner flat data", e);
        throw new Error("Could not retrieve flat details. Please check configuration.");
    }
}

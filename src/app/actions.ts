'use server';

import { google } from 'googleapis';
import type { FlatData } from '@/components/dashboard/dashboard-client';


const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const RANGE = 'Sheet1'; // Assumes data is on 'Sheet1'. Change if needed.

const getSheetsApi = () => {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        throw new Error('Google Sheets API credentials are not set. Please configure GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in your hosting environment variables.');
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
        throw new Error("The GOOGLE_SHEET_ID is not configured. Please set it up in your hosting environment variables.");
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
            throw new Error(`Could not find the Google Sheet. Please make sure the GOOGLE_SHEET_ID in your hosting environment is correct and the range ('${RANGE}') exists.`);
        }
        // Re-throw specific errors
        if (e.message.includes("missing the 'Registered' column")) {
            throw e;
        }
        throw new Error("Could not connect to Google Sheets. Please ensure your environment variables are correct and the service account has permission to access the sheet.");
    }
}


export async function saveFlatDataAction(flatId: string, data: FlatData): Promise<void> {
    if (!SPREADSHEET_ID) {
        throw new Error("The GOOGLE_SHEET_ID is not configured. Please set it up in your hosting environment variables.");
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
        const flatIdIndex = headerRow.indexOf('Flat ID');
        if (flatIdIndex === -1) {
            throw new Error("Your Google Sheet is missing the 'Flat ID' column.");
        }

        const rowIndex = rows.findIndex(row => row[flatIdIndex] === flatId);
        
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
        return { success: false, message: "Server is not configured correctly. Please contact support." };
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
        throw new Error("The GOOGLE_SHEET_ID is not configured. Please set it up in your hosting environment variables.");
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

export type OwnerEditableData = {
    ownerName: string;
    contactNumber: string;
    email: string;
    familyMembers: string;
    issues: string;
};

export async function updateOwnerDataAction(flatId: string, data: OwnerEditableData): Promise<{ success: boolean; message: string }> {
    if (!SPREADSHEET_ID) {
        return { success: false, message: "Server is not configured correctly. Please contact support." };
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
        const flatIdIndex = headerRow.indexOf('Flat ID');
        if (flatIdIndex === -1) {
            throw new Error("Sheet is missing 'Flat ID' column.");
        }
        const passwordIndex = headerRow.indexOf('Password');
        const rowIndex = rows.findIndex(row => row[flatIdIndex] === flatId);
        
        if (rowIndex === -1) {
            throw new Error(`Flat ID "${flatId}" not found in the sheet.`);
        }

        const existingRow = rows[rowIndex];
        
        const maintenanceStatus = existingRow[9] || 'pending';
        const registered = existingRow[10] === 'TRUE';
        const password = (passwordIndex !== -1 && existingRow[passwordIndex]) ? existingRow[passwordIndex] : '';

        const [block, floorAndFlat] = flatId.split('-');
        const floor = floorAndFlat.match(/\d+/)?.[0] || '';
        const flat = floorAndFlat.match(/[A-Z]/)?.[0] || '';
        
        const rowData = [
            flatId,
            block,
            floor,
            flat,
            data.ownerName,
            data.contactNumber,
            data.email,
            data.familyMembers,
            data.issues,
            maintenanceStatus,
            registered ? 'TRUE' : 'FALSE',
            new Date().toISOString()
        ];

        if (passwordIndex !== -1) {
             while (rowData.length <= passwordIndex) {
                rowData.push('');
             }
             rowData[passwordIndex] = password;
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

        return { success: true, message: 'Details updated successfully!' };

    } catch(e: any) {
        console.error("Failed to save owner data to Google Sheets.", e);
        return { success: false, message: e.message || "Failed to save data. Please check your Google Sheets configuration and permissions." };
    }
}

export async function signupOwnerAction(block: string, floor: string, flat: string, password_from_user: string): Promise<{ success: boolean; message: string; flatId?: string }> {
    if (!SPREADSHEET_ID) {
        return { success: false, message: "Server is not configured correctly. Please contact support." };
    }
    
    const flatId = `${block}-${floor}${flat}`;

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
        const flatIdIndex = headerRow.indexOf('Flat ID');
        const passwordIndex = headerRow.indexOf('Password');
        const registeredIndex = headerRow.indexOf('Registered');
        const lastUpdatedIndex = headerRow.indexOf('Last Updated');

        if (flatIdIndex === -1 || passwordIndex === -1 || registeredIndex === -1 || lastUpdatedIndex === -1) {
            return { success: false, message: "Your Google Sheet must have the following columns: 'Flat ID', 'Password', 'Registered', 'Last Updated'." };
        }
        
        const rowIndex = rows.findIndex(row => row[flatIdIndex] === flatId);
        
        if (rowIndex === -1) {
            const blockIndex = headerRow.indexOf('Block');
            const floorIndex = headerRow.indexOf('Floor');
            const flatIndex_col = headerRow.indexOf('Flat');

            if (blockIndex === -1 || floorIndex === -1 || flatIndex_col === -1) {
                return { success: false, message: "Your Google Sheet must have 'Block', 'Floor', and 'Flat' columns to sign up a new flat." };
            }

            const newRowData = Array(headerRow.length).fill('');
            newRowData[flatIdIndex] = flatId;
            newRowData[blockIndex] = block;
            newRowData[floorIndex] = floor;
            newRowData[flatIndex_col] = flat;
            newRowData[passwordIndex] = password_from_user;
            newRowData[registeredIndex] = 'FALSE';
            newRowData[lastUpdatedIndex] = new Date().toISOString();

            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: RANGE,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [newRowData],
                },
            });

            return { success: true, message: 'Signup successful! Please log in to update your details.', flatId };

        } else {
            const flatRow = rows[rowIndex];
            const isRegistered = flatRow[registeredIndex] === 'TRUE';
            const hasPassword = flatRow[passwordIndex] && flatRow[passwordIndex].length > 0;

            if (isRegistered) {
                return { success: false, message: "This flat is already registered. Please log in or contact administration if you believe this is an error." };
            }
            
            if (hasPassword) {
                 return { success: false, message: "An account for this flat already exists. Please log in or contact administration." };
            }


            // Update existing row for an unregistered flat
            const updatedRow = [...flatRow];
            
            const maxIndex = Math.max(passwordIndex, registeredIndex, lastUpdatedIndex);
            while (updatedRow.length <= maxIndex) {
                updatedRow.push('');
            }

            updatedRow[passwordIndex] = password_from_user;
            updatedRow[registeredIndex] = 'FALSE';
            updatedRow[lastUpdatedIndex] = new Date().toISOString();
            
            const updateRange = `${RANGE}!A${rowIndex + 1}`;
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: updateRange,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [updatedRow],
                },
            });
            
            return { success: true, message: 'Signup successful! Please log in to update your details.', flatId };
        }

    } catch (e: any) {
        console.error("Owner signup failed.", e);
        return { success: false, message: e.message || "An error occurred during signup. Please try again." };
    }
}

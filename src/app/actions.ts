'use server';

import { google } from 'googleapis';
import type { FlatData as BaseFlatData } from '@/components/dashboard/dashboard-client';

export type FlatData = BaseFlatData & {
    emergencyContactNumber: string;
    parkingAllocation: 'Covered' | 'Open' | 'No Parking' | '';
    bloodGroup: string;
    carNumber: string;
};

// All column names used in the sheet
const COLUMN_NAMES = [
    'Flat ID', 'Block', 'Floor', 'Flat', 'Owner Name', 'Contact Number',
    'Email', 'Family Members', 'Issues / Complaints', 'Maintenance Status',
    'Registered', 'Password', 'Last Updated', 'Move In Month',
    'Emergency Contact Number', 'Parking Allocation', 'Blood Group', 'Car Number'
];
const MAX_COLUMN_LETTER = 'R';


const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Sheet1'; // Name of the sheet/tab in your Google Sheet

// Helper to authenticate and get the Google Sheets API client
async function getSheetsClient() {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (serviceAccountEmail && privateKey) {
        // Use service account credentials if provided
        const jwtClient = new google.auth.JWT(
            serviceAccountEmail,
            undefined,
            privateKey.replace(/\\n/g, '\n'), // Important for environment variables
            ['https://www.googleapis.com/auth/spreadsheets']
        );
        await jwtClient.authorize();
        return google.sheets({ version: 'v4', auth: jwtClient });
    } else {
        // Fallback to Application Default Credentials for GCP environments or local `gcloud` auth
        const auth = new google.auth.GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const authClient = await auth.getClient();
        return google.sheets({ version: 'v4', auth: authClient });
    }
}


// Helper to handle API errors consistently.
const handleApiError = (e: any, context: string): Error => {
    console.error(`Failed to ${context} via Google Sheets API.`, e);
    const message = e.message || 'An unknown error occurred.';
    return new Error(`There was a problem connecting to the database (${context}). Please try again later. Details: ${message}`);
};

// Helper to convert from various formats to the standard '{blockNumber}{flat}{floor}'
const normalizeFlatId = (id: any): string => {
    if (!id) return '';
    return id.toString()
        .trim()
        .toUpperCase()
        .replace(/^BLOCK\s*/, '')
        .replace(/FLAT|FLOOR/g, '')
        .replace(/[\s,-]+/g, '');
};

// Find the row number for a given flat ID
async function findRowByFlatId(sheets: any, flatId: string): Promise<number | null> {
    try {
        const range = `'${SHEET_NAME}'!A:A`;
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range, // Search in the 'Flat ID' column
        });
        const rows = response.data.values;
        if (!rows) return null;

        for (let i = 0; i < rows.length; i++) {
            if (rows[i][0] && normalizeFlatId(rows[i][0]) === normalizeFlatId(flatId)) {
                return i + 1; // Return 1-based row index
            }
        }
        return null;
    } catch (e) {
        throw handleApiError(e, 'find row by flat ID');
    }
}

export async function getFlatsData(): Promise<Record<string, FlatData>> {
    try {
        const sheets = await getSheetsClient();
        const range = `'${SHEET_NAME}'!A:${MAX_COLUMN_LETTER}`;
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range, // Adjust range to cover all columns
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return {};
        }

        const headers = rows[0] as string[];
        const headerIndexMap = new Map(headers.map((h, i) => [h, i]));
        
        const flatData: Record<string, FlatData> = {};
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const flatIdFromSheet = row[headerIndexMap.get('Flat ID')!];
            if (flatIdFromSheet) {
                const normalizedId = normalizeFlatId(flatIdFromSheet);
                flatData[normalizedId] = {
                    ownerName: row[headerIndexMap.get('Owner Name')!] || '',
                    contactNumber: row[headerIndexMap.get('Contact Number')!] || '',
                    email: row[headerIndexMap.get('Email')!] || '',
                    familyMembers: row[headerIndexMap.get('Family Members')!] || '',
                    issues: row[headerIndexMap.get('Issues / Complaints')!] || '',
                    maintenanceStatus: row[headerIndexMap.get('Maintenance Status')!] || 'pending',
                    registered: row[headerIndexMap.get('Registered')!] === 'TRUE',
                    lastUpdated: row[headerIndexMap.get('Last Updated')!] || '',
                    moveInMonth: row[headerIndexMap.get('Move In Month')!] || '',
                    emergencyContactNumber: row[headerIndexMap.get('Emergency Contact Number')!] || '',
                    parkingAllocation: row[headerIndexMap.get('Parking Allocation')!] || '',
                    bloodGroup: row[headerIndexMap.get('Blood Group')!] || '',
                    carNumber: row[headerIndexMap.get('Car Number')!] || '',
                };
            }
        }
        return flatData;
    } catch (e: any) {
        throw handleApiError(e, 'load flat data');
    }
}

export async function saveFlatDataAction(flatId: string, data: FlatData): Promise<void> {
    const normalizedFlatId = normalizeFlatId(flatId);
    try {
        const sheets = await getSheetsClient();
        const rowNumber = await findRowByFlatId(sheets, normalizedFlatId);

        if (!rowNumber) {
            throw new Error(`Flat ID ${normalizedFlatId} not found in the sheet for updating.`);
        }

        // Get headers to map column names to indices
        const headersResponse = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `'${SHEET_NAME}'!A1:${MAX_COLUMN_LETTER}1` });
        const headers = headersResponse.data.values?.[0] as string[];
        if (!headers) throw new Error("Sheet headers not found.");
        const headerIndexMap = new Map(headers.map((h, i) => [h, i]));

        // Fetch the existing row data to preserve fields like Password
        const getRange = `'${SHEET_NAME}'!A${rowNumber}:${String.fromCharCode(65 + headers.length-1)}${rowNumber}`;
        const getResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: getRange,
        });
        const existingRowValues = getResponse.data.values?.[0] || [];

        const updatedValues = [...existingRowValues];

        // Map data to the correct column index and update it
        const updateField = (fieldName: string, value: any) => {
            const index = headerIndexMap.get(fieldName);
            if (index !== undefined) {
                updatedValues[index] = value;
            }
        };

        updateField('Owner Name', data.ownerName);
        updateField('Contact Number', data.contactNumber);
        updateField('Email', data.email);
        updateField('Family Members', data.familyMembers);
        updateField('Issues / Complaints', data.issues);
        updateField('Maintenance Status', data.maintenanceStatus);
        updateField('Registered', data.registered ? 'TRUE' : 'FALSE');
        updateField('Last Updated', new Date().toISOString());
        updateField('Move In Month', data.moveInMonth);
        updateField('Emergency Contact Number', data.emergencyContactNumber);
        updateField('Parking Allocation', data.parkingAllocation);
        updateField('Blood Group', data.bloodGroup);
        updateField('Car Number', data.carNumber);

        const updateRange = `'${SHEET_NAME}'!A${rowNumber}:${String.fromCharCode(65 + headers.length-1)}${rowNumber}`;
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: updateRange,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [updatedValues] },
        });

    } catch (e: any) {
        throw handleApiError(e, `save data for flat ${flatId}`);
    }
}


export async function loginOwnerAction(flatId: string, password_from_user: string): Promise<{ success: boolean; message: string; flatId?: string }> {
    const normalizedFlatId = normalizeFlatId(flatId);
    if (!normalizedFlatId) return { success: false, message: "Flat ID is required." };

    try {
        const sheets = await getSheetsClient();
        const rowNumber = await findRowByFlatId(sheets, normalizedFlatId);

        if (!rowNumber) return { success: false, message: "Flat ID not found." };
        
        const range = `'${SHEET_NAME}'!A${rowNumber}:${MAX_COLUMN_LETTER}${rowNumber}`;
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });

        const row = response.data.values?.[0];
        if (!row) return { success: false, message: "Flat ID not found." };

        const headersResponse = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `'${SHEET_NAME}'!A1:${MAX_COLUMN_LETTER}1` });
        const headers = headersResponse.data.values?.[0];
        if (!headers) throw new Error("Sheet headers not found.");
        const headerIndexMap = new Map(headers.map((h, i) => [h, i]));

        const passwordIndex = headerIndexMap.get('Password');
        if (passwordIndex === undefined) throw new Error("Password column not found in sheet.");
        
        const correctPassword = row[passwordIndex];
        if (correctPassword && correctPassword === password_from_user) {
            return { success: true, message: "Login successful.", flatId: normalizedFlatId };
        } else {
            return { success: false, message: "Incorrect password." };
        }
    } catch (e: any) {
        return { success: false, message: handleApiError(e, 'process owner login').message };
    }
}

export type OwnerFlatData = FlatData & {
    flatId: string;
    block: string;
    floor: string;
    flat: string;
};

export async function getOwnerFlatData(flatId: string): Promise<OwnerFlatData | null> {
    const normalizedFlatId = normalizeFlatId(flatId);
    try {
        const sheets = await getSheetsClient();
        const rowNumber = await findRowByFlatId(sheets, normalizedFlatId);
        
        if (!rowNumber) return null;

        const range = `'${SHEET_NAME}'!A${rowNumber}:${MAX_COLUMN_LETTER}${rowNumber}`;
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });
        const row = response.data.values?.[0];
        
        if (!row) return null;

        const headersResponse = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `'${SHEET_NAME}'!A1:${MAX_COLUMN_LETTER}1` });
        const headers = headersResponse.data.values?.[0];
        if (!headers) throw new Error("Sheet headers not found.");
        const headerIndexMap = new Map(headers.map((h, i) => [h, i]));

        return {
            flatId: row[headerIndexMap.get('Flat ID')!] || '',
            block: row[headerIndexMap.get('Block')!] || '',
            floor: row[headerIndexMap.get('Floor')!] || '',
            flat: row[headerIndexMap.get('Flat')!] || '',
            ownerName: row[headerIndexMap.get('Owner Name')!] || '',
            contactNumber: row[headerIndexMap.get('Contact Number')!] || '',
            email: row[headerIndexMap.get('Email')!] || '',
            familyMembers: row[headerIndexMap.get('Family Members')!] || '',
            issues: row[headerIndexMap.get('Issues / Complaints')!] || '',
            maintenanceStatus: row[headerIndexMap.get('Maintenance Status')!] || 'pending',
            registered: row[headerIndexMap.get('Registered')!] === 'TRUE',
            lastUpdated: row[headerIndexMap.get('Last Updated')!] || '',
            moveInMonth: row[headerIndexMap.get('Move In Month')!] || '',
            emergencyContactNumber: row[headerIndexMap.get('Emergency Contact Number')!] || '',
            parkingAllocation: row[headerIndexMap.get('Parking Allocation')!] || '',
            bloodGroup: row[headerIndexMap.get('Blood Group')!] || '',
            carNumber: row[headerIndexMap.get('Car Number')!] || '',
        };
    } catch(e: any) {
        throw handleApiError(e, 'fetch owner flat data');
    }
}

export type OwnerEditableData = {
    ownerName: string;
    contactNumber: string;
    email: string;
    familyMembers: string;
    issues: string;
    registered: boolean;
    moveInMonth: string;
    emergencyContactNumber: string;
    parkingAllocation: 'Covered' | 'Open' | 'No Parking' | '';
    bloodGroup: string;
    maintenanceStatus: string;
    carNumber: string;
};

export async function updateOwnerDataAction(flatId: string, data: OwnerEditableData): Promise<{ success: boolean; message: string }> {
    const normalizedFlatId = normalizeFlatId(flatId);
    try {
        const sheets = await getSheetsClient();
        const rowNumber = await findRowByFlatId(sheets, normalizedFlatId);

        if (!rowNumber) {
            return { success: false, message: `Could not find flat ${normalizedFlatId} to update.` };
        }

        const headersResponse = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `'${SHEET_NAME}'!A1:${MAX_COLUMN_LETTER}1` });
        const headers = headersResponse.data.values?.[0] as string[];
        if (!headers) throw new Error("Sheet headers not found.");
        const headerIndexMap = new Map(headers.map((h, i) => [h, i]));

        // Fetch the existing row to preserve immutable fields
        const getRange = `'${SHEET_NAME}'!A${rowNumber}:${String.fromCharCode(65 + headers.length-1)}${rowNumber}`;
        const getResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: getRange,
        });
        const existingRowValues = getResponse.data.values?.[0] || [];
        
        const updatedValues = [...existingRowValues];

        // Function to safely update a value in the array by column name
        const updateField = (fieldName: string, value: any) => {
            const index = headerIndexMap.get(fieldName);
            if (index !== undefined) {
                updatedValues[index] = value;
            }
        };

        // Update only the editable fields
        updateField('Owner Name', data.ownerName);
        updateField('Contact Number', data.contactNumber);
        updateField('Email', data.email);
        updateField('Family Members', data.familyMembers);
        updateField('Issues / Complaints', data.issues);
        updateField('Registered', data.registered ? 'TRUE' : 'FALSE');
        updateField('Last Updated', new Date().toISOString());
        updateField('Move In Month', data.moveInMonth);
        updateField('Emergency Contact Number', data.emergencyContactNumber);
        updateField('Parking Allocation', data.parkingAllocation);
        updateField('Blood Group', data.bloodGroup);
        updateField('Maintenance Status', data.maintenanceStatus);
        updateField('Car Number', data.carNumber);
        
        const range = `'${SHEET_NAME}'!A${rowNumber}:${String.fromCharCode(65 + headers.length-1)}${rowNumber}`;
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [updatedValues] },
        });

        return { success: true, message: 'Details updated successfully!' };

    } catch(e: any) {
        return { success: false, message: handleApiError(e, 'update owner data').message };
    }
}

export async function signupOwnerAction(block: string, floor: string, flat: string, password_from_user: string): Promise<{ success: boolean; message: string; flatId?: string }> {
    const blockNumber = block.replace('Block ', '');
    const flatId = `${blockNumber}${flat}${floor}`.toUpperCase();

    try {
        const sheets = await getSheetsClient();
        const rowNumber = await findRowByFlatId(sheets, flatId);

        if (rowNumber) { // Flat exists
            const range = `'${SHEET_NAME}'!A${rowNumber}:${MAX_COLUMN_LETTER}${rowNumber}`;
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: range,
            });
            const row = response.data.values?.[0];
            if (!row) throw new Error("Could not retrieve existing flat data.");

            const headersResponse = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `'${SHEET_NAME}'!A1:${MAX_COLUMN_LETTER}1` });
            const headers = headersResponse.data.values?.[0] as string[];
            if (!headers) throw new Error("Sheet headers not found.");
            const headerIndexMap = new Map(headers.map((h, i) => [h, i]));

            if (row[headerIndexMap.get('Registered')!] === 'TRUE') {
                return { success: false, message: "This flat is already registered. Please log in or contact administration." };
            }
            if (row[headerIndexMap.get('Password')!] && row[headerIndexMap.get('Password')!].length > 0) {
                 return { success: false, message: "An account for this flat already exists. Please log in." };
            }

            // Update existing row with password
            const passwordColumnLetter = String.fromCharCode(65 + headers.indexOf('Password'));
            const updateRange = `'${SHEET_NAME}'!${passwordColumnLetter}${rowNumber}`;
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: updateRange,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [[password_from_user]] },
            });
            return { success: true, message: 'Signup successful! Please log in to update your details.', flatId };

        } else { // Flat does not exist, create it
            const newRowData = [
                flatId, block, floor, flat, '', '', '', '', '', 'pending',
                'FALSE', password_from_user, new Date().toISOString(),
                '', '', '', '', ''
            ];

            const appendRange = `'${SHEET_NAME}'!A:${MAX_COLUMN_LETTER}`;
            await sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEET_ID,
                range: appendRange,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [newRowData] },
            });
            return { success: true, message: 'Signup successful! Please log in to update your details.', flatId };
        }
    } catch (e: any) {
        return { success: false, message: handleApiError(e, 'process owner signup').message };
    }
}

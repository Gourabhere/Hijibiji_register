
'use server';

import { google } from 'googleapis';
import type { FlatData as BaseFlatData } from '@/components/dashboard/dashboard-client';

export type FlatData = BaseFlatData & {
    emergencyContactNumber: string;
    parkingAllocation: 'Covered' | 'Open' | 'No Parking' | '';
    bloodGroup: string;
    carNumber: string;
    registrationStatus: string;
    passwordExists: boolean;
};

// All column names used in the sheet
const COLUMN_NAMES = [
    'Flat ID', 'Block', 'Floor', 'Flat', 'Owner Name', 'Contact Number',
    'Email', 'Family Members', 'Issues / Complaints', 'Maintenance Status',
    'Registered', 'Registration Status', 'Last Updated', 'Move In Month', 'Password',
    'Emergency Contact Number', 'Parking Allocation', 'Blood Group', 'Car Number'
];
const MAX_COLUMN_LETTER = 'S';


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
        .replace(/^'/, '') // Remove leading single quote if present
        .replace(/^BLOCK\s*/, '')
        .replace(/FLAT|FLOOR/g, '')
        .replace(/[\s,-]+/g, '');
};

// Find the row number for a given flat ID
async function findRowByFlatId(sheets: any, flatId: string, sheetName: string = SHEET_NAME): Promise<number | null> {
    try {
        const range = `'${sheetName}'!A:A`;
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
        throw handleApiError(e, `find row by flat ID in ${sheetName}`);
    }
}

// Check if the contact number is valid for the given flat ID in Sheet1
async function validateContactNumber(sheets: any, flatId: string, contactNumber: string): Promise<boolean> {
    try {
        const rowNumber = await findRowByFlatId(sheets, flatId, SHEET_NAME);
        if (!rowNumber) {
            // If the flat doesn't exist at all in Sheet1, it's not valid for signup against pre-filled data.
            // This might happen if an admin hasn't added the flat yet.
            // Depending on desired logic, you could allow creation, but for now, we deny.
            return false;
        }

        // Get headers to find the 'Contact Number' column index
        const headersResponse = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `'${SHEET_NAME}'!A1:${MAX_COLUMN_LETTER}1` });
        const headers = headersResponse.data.values?.[0] as string[];
        if (!headers) throw new Error("Sheet headers not found.");
        const headerIndexMap = new Map(headers.map((h, i) => [h, i]));
        const contactNumberIndex = headerIndexMap.get('Contact Number');

        if (contactNumberIndex === undefined) {
            throw new Error("'Contact Number' column not found in Sheet1.");
        }

        // Get the specific row data
        const range = `'${SHEET_NAME}'!A${rowNumber}:${MAX_COLUMN_LETTER}${rowNumber}`;
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });

        const row = response.data.values?.[0];
        if (!row || !row[contactNumberIndex]) {
            return false; // No contact number found for this flat in Sheet1
        }
        
        // Clean up both numbers to only digits before comparing
        const sheetContactNumbers = row[contactNumberIndex].toString().replace(/\D/g, '');
        const userContactNumber = contactNumber.replace(/\D/g, '');

        return sheetContactNumbers.includes(userContactNumber);
    } catch (e) {
        throw handleApiError(e, 'validate contact number');
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
                const password = row[headerIndexMap.get('Password')!];
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
                    registrationStatus: row[headerIndexMap.get('Registration Status')!] || 'Pending',
                    passwordExists: !!password && password.length > 0,
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
        updateField('Registration Status', data.registrationStatus);
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
        const password = row[headerIndexMap.get('Password')!];

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
            registrationStatus: row[headerIndexMap.get('Registration Status')!] || 'Pending',
            lastUpdated: row[headerIndexMap.get('Last Updated')!] || '',
            moveInMonth: row[headerIndexMap.get('Move In Month')!] || '',
            emergencyContactNumber: row[headerIndexMap.get('Emergency Contact Number')!] || '',
            parkingAllocation: row[headerIndexMap.get('Parking Allocation')!] || '',
            bloodGroup: row[headerIndexMap.get('Blood Group')!] || '',
            carNumber: row[headerIndexMap.get('Car Number')!] || '',
            passwordExists: !!password && password.length > 0,
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
    maintenanceStatus: string;
    moveInMonth: string;
    emergencyContactNumber: string;
    parkingAllocation: 'Covered' | 'Open' | 'No Parking' | '';
    bloodGroup: string;
    registrationStatus: string;
    carNumber: string;
};

export async function updateOwnerDataAction(flatId: string, data: Partial<OwnerEditableData>): Promise<{ success: boolean; message: string }> {
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
            if (value === undefined) return;
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
        updateField('Maintenance Status', data.maintenanceStatus);
        updateField('Registered', data.registered ? 'TRUE' : 'FALSE');
        updateField('Last Updated', new Date().toISOString());
        updateField('Move In Month', data.moveInMonth);
        updateField('Emergency Contact Number', data.emergencyContactNumber);
        updateField('Parking Allocation', data.parkingAllocation);
        updateField('Blood Group', data.bloodGroup);
        updateField('Registration Status', data.registrationStatus);
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

export type SignupFormData = {
  countryCode: string;
  contactNumber: string;
};

export type PreSignupData = { 
    passwordExists: boolean 
};

export async function getPreSignupFlatDataAction(flatId: string): Promise<PreSignupData | null> {
    const normalizedFlatId = normalizeFlatId(flatId);
    if (!normalizedFlatId) return null;

    try {
        const sheets = await getSheetsClient();
        const rowNumber = await findRowByFlatId(sheets, normalizedFlatId);

        if (!rowNumber) return { passwordExists: false }; // Flat doesn't exist at all, proceed with fresh signup.

        const range = `'${SHEET_NAME}'!A${rowNumber}:${MAX_COLUMN_LETTER}${rowNumber}`;
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });

        const row = response.data.values?.[0];
        if (!row) return { passwordExists: false };

        const headersResponse = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `'${SHEET_NAME}'!A1:${MAX_COLUMN_LETTER}1` });
        const headers = headersResponse.data.values?.[0] as string[];
        if (!headers) throw new Error("Sheet headers not found.");
        const headerIndexMap = new Map(headers.map((h, i) => [h, i]));
        
        const password = row[headerIndexMap.get('Password')!];
        if (password && password.length > 0) {
            return { passwordExists: true };
        }
        
        return {
            passwordExists: false,
        };

    } catch (e: any) {
        // Don't throw, just return null so signup can proceed as if no data exists.
        console.error("Error in getPreSignupFlatDataAction", e);
        return null;
    }
}

export async function signupOwnerAction(
  block: string, 
  floor: string, 
  flat: string, 
  password_from_user: string,
  formData: SignupFormData
): Promise<{ success: boolean; message: string; flatId?: string }> {
    const blockNumber = block.replace('Block ', '');
    const flatId = `${blockNumber}${flat}${floor}`.toUpperCase();

    try {
        const sheets = await getSheetsClient();
        
        // Step 1: Validate contact number against Sheet1
        const contactNumber = formData.contactNumber;
        const isContactValid = await validateContactNumber(sheets, flatId, contactNumber);
        if (!isContactValid) {
            return { success: false, message: "The contact number provided does not match our records for this flat." };
        }

        const rowNumber = await findRowByFlatId(sheets, flatId);
        
        const headersResponse = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `'${SHEET_NAME}'!A1:${MAX_COLUMN_LETTER}1` });
        const headers = headersResponse.data.values?.[0] as string[];
        if (!headers) throw new Error("Sheet headers not found.");
        const headerIndexMap = new Map(headers.map((h, i) => [h, i]));

        if (rowNumber) { // Flat exists, update it
            const range = `'${SHEET_NAME}'!A${rowNumber}:${MAX_COLUMN_LETTER}${rowNumber}`;
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: SPREADSHEET_ID,
                range: range,
            });
            const row = response.data.values?.[0];
            if (!row) throw new Error("Could not retrieve existing flat data.");

            if (row[headerIndexMap.get('Password')!] && row[headerIndexMap.get('Password')!].length > 0) {
                 return { success: false, message: "An account for this flat already exists. Please log in." };
            }

            // Update existing row with new details
            const existingRowValues = [...row];
            const updateField = (fieldName: string, value: any) => {
                const index = headerIndexMap.get(fieldName);
                if (index !== undefined) {
                    existingRowValues[index] = value;
                }
            };
            
            updateField('Password', password_from_user);
            updateField('Last Updated', new Date().toISOString());
            // Set to FALSE on signup, user must confirm details later.
            updateField('Registered', 'FALSE');
            updateField('Registration Status', '');

            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: range,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [existingRowValues] },
            });
            return { success: true, message: 'Signup successful! Please log in to update your details.', flatId };

        } else { // Flat does not exist, create it
             const newRowData = COLUMN_NAMES.reduce((acc, colName) => {
                switch(colName) {
                    // Prepend flatId with a single quote to force string format in Sheets
                    case 'Flat ID': acc.push(`'${flatId}`); break;
                    case 'Block': acc.push(block); break;
                    case 'Floor': acc.push(floor); break;
                    case 'Flat': acc.push(flat); break;
                    case 'Password': acc.push(password_from_user); break;
                    case 'Contact Number': acc.push(formData.contactNumber); break;
                    case 'Maintenance Status': acc.push('pending'); break;
                    case 'Registered': acc.push('FALSE'); break; // Set to FALSE on signup
                    case 'Registration Status': acc.push(''); break; // Blank on signup
                    case 'Last Updated': acc.push(new Date().toISOString()); break;
                    default: acc.push(''); break;
                }
                return acc;
            }, [] as (string | boolean | number)[]);


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

    
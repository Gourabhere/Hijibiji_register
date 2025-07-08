
'use server';

import type { FlatData } from '@/components/dashboard/dashboard-client';

const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/5ce4kfqrdyy4t';

// Helper to handle API errors consistently.
const handleApiError = (e: any, context: string): Error => {
    console.error(`Failed to ${context} via SheetDB.`, e);
    const message = e.message || 'An unknown error occurred.';
    // Provide a more user-friendly error message
    return new Error(`There was a problem connecting to the database (${context}). Please try again later. Details: ${message}`);
};

// Helper to convert from various formats to the standard '{blockNumber}{flat}{floor}'
const normalizeFlatId = (id: any): string => {
    if (!id) return '';
    const strId = id.toString().trim().toUpperCase();

    // Check for old format: "Block 1-1A" or "Block 1 - 1A" etc. or "{floor}{flat}{block}"
    const oldFormatMatch1 = strId.match(/^BLOCK\s*(\d+)\s*-\s*(\d+)([A-Z])$/);
    if (oldFormatMatch1) {
        const [, block, floor, flat] = oldFormatMatch1;
        return `${block}${flat}${floor}`;
    }
    
    // Check for previous format: "{floor}{flat}{blockNumber}"
    const oldFormatMatch2 = strId.match(/^(\d+)([A-Z])(\d+)$/);
    if (oldFormatMatch2) {
        const strFloor = oldFormatMatch2[1];
        const strFlat = oldFormatMatch2[2];
        const strBlock = oldFormatMatch2[3];
        // This is a simple heuristic. If floor part has more digits, it's likely the old format.
        // This might not be perfect for all cases but handles floor > 9 vs block > 9.
        if (strFloor.length > strBlock.length) {
            return `${strBlock}${strFlat}${strFloor}`;
        }
    }


    // Assume it's the new format, just remove spaces. e.g. "1 A 1" -> "1A1"
    return strId.replace(/\s+/g, "");
};

// Maps a row object from SheetDB to the app's FlatData type.
const mapRowToFlatData = (row: any): FlatData => {
    return {
        ownerName: row['Owner Name'] || '',
        contactNumber: row['Contact Number'] || '',
        email: row['Email'] || '',
        familyMembers: row['Family Members'] || '',
        issues: row['Issues / Complaints'] || '',
        maintenanceStatus: row['Maintenance Status'] || 'pending',
        registered: row['Registered'] === 'TRUE',
        lastUpdated: row['Last Updated'] || '',
    };
};

export async function getFlatsData(): Promise<Record<string, FlatData>> {
    try {
        const response = await fetch(SHEETDB_API_URL);
        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }
        const rows: any[] = await response.json();

        const flatData: Record<string, FlatData> = {};
        for (const row of rows) {
            const flatIdFromSheet = row['Flat ID'];
            if (flatIdFromSheet) {
                flatData[normalizeFlatId(flatIdFromSheet)] = mapRowToFlatData(row);
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
        const parts = normalizedFlatId.match(/^(\d+)([A-Z])(\d+)$/);
        if (!parts) {
            throw new Error(`Invalid flat ID format: ${flatId}`);
        }
        const block = `Block ${parts[1]}`;
        const flat = parts[2];
        const floor = parts[3];
        
        const updatedDataWithTimestamp = { ...data, lastUpdated: new Date().toISOString() };
        
        const rowData = {
            'Flat ID': normalizedFlatId,
            'Block': block,
            'Floor': floor,
            'Flat': flat,
            'Owner Name': updatedDataWithTimestamp.ownerName,
            'Contact Number': updatedDataWithTimestamp.contactNumber,
            'Email': updatedDataWithTimestamp.email,
            'Family Members': updatedDataWithTimestamp.familyMembers,
            'Issues / Complaints': updatedDataWithTimestamp.issues,
            'Maintenance Status': updatedDataWithTimestamp.maintenanceStatus,
            'Registered': updatedDataWithTimestamp.registered ? 'TRUE' : 'FALSE',
            'Last Updated': updatedDataWithTimestamp.lastUpdated,
        };
        
        const url = `${SHEETDB_API_URL}/Flat ID/${normalizedFlatId}`;
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rowData)
        });

        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }
    } catch (e: any) {
        throw handleApiError(e, `save data for flat ${flatId}`);
    }
}

export async function loginOwnerAction(flatId: string, password_from_user: string): Promise<{ success: boolean; message: string; flatId?: string }> {
    const normalizedFlatId = normalizeFlatId(flatId);
    if (!normalizedFlatId) {
        return { success: false, message: "Flat ID is required." };
    }

    try {
        const searchUrl = `${SHEETDB_API_URL}/search?Flat%20ID=${encodeURIComponent(normalizedFlatId)}`;
        const response = await fetch(searchUrl);
        if (!response.ok) {
             throw new Error(`API responded with status ${response.status}`);
        }
        const data: any[] = await response.json();
        
        const ownerRow = data.length > 0 ? data[0] : null;

        if (!ownerRow) {
            return { success: false, message: "Flat ID not found." };
        }

        const correctPassword = ownerRow['Password'];
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
        const searchUrl = `${SHEETDB_API_URL}/search?Flat%20ID=${encodeURIComponent(normalizedFlatId)}`;
        const response = await fetch(searchUrl);

        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }
        const data: any[] = await response.json();
        
        const ownerRow = data.length > 0 ? data[0] : null;
        
        if (!ownerRow) {
            return null;
        }

        return {
            flatId: ownerRow['Flat ID'] || '',
            block: ownerRow['Block'] || '',
            floor: ownerRow['Floor'] || '',
            flat: ownerRow['Flat'] || '',
            ownerName: ownerRow['Owner Name'] || '',
            contactNumber: ownerRow['Contact Number'] || '',
            email: ownerRow['Email'] || '',
            familyMembers: row['Family Members'] || '',
            issues: row['Issues / Complaints'] || '',
            maintenanceStatus: row['Maintenance Status'] || 'pending',
            registered: row['Registered'] === 'TRUE',
            lastUpdated: row['Last Updated'] || '',
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
};

export async function updateOwnerDataAction(flatId: string, data: OwnerEditableData): Promise<{ success: boolean; message: string }> {
    const normalizedFlatId = normalizeFlatId(flatId);
    try {
        const rowData = {
            'Owner Name': data.ownerName,
            'Contact Number': data.contactNumber,
            'Email': data.email,
            'Family Members': data.familyMembers,
            'Issues / Complaints': data.issues,
            'Registered': data.registered ? 'TRUE' : 'FALSE',
            'Last Updated': new Date().toISOString(),
        };

        const url = `${SHEETDB_API_URL}/Flat ID/${normalizedFlatId}`;
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rowData)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`API responded with status ${response.status}: ${JSON.stringify(errorBody)}`);
        }
        return { success: true, message: 'Details updated successfully!' };

    } catch(e: any) {
        return { success: false, message: handleApiError(e, 'update owner data').message };
    }
}

export async function signupOwnerAction(block: string, floor: string, flat: string, password_from_user: string): Promise<{ success: boolean; message: string; flatId?: string }> {
    const blockNumber = block.replace('Block ', '');
    const flatId = `${blockNumber}${flat}${floor}`.toUpperCase();

    try {
        const searchUrl = `${SHEETDB_API_URL}/search?Flat%20ID=${encodeURIComponent(flatId)}`;
        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) {
            throw new Error(`API search responded with status ${searchResponse.status}`);
        }
        const data: any[] = await searchResponse.json();
        const flatRow = data.length > 0 ? data[0] : null;

        // Case 1: Flat exists in the sheet
        if (flatRow) {
            if (flatRow['Registered'] === 'TRUE') {
                return { success: false, message: "This flat is already registered. Please log in or contact administration if you believe this is an error." };
            }
            if (flatRow['Password'] && flatRow['Password'].length > 0) {
                return { success: false, message: "An account for this flat already exists. Please log in or contact administration." };
            }

            // Flat exists but is unregistered and has no password. Update it.
            const updateUrl = `${SHEETDB_API_URL}/Flat ID/${flatId}`;
            const updateResponse = await fetch(updateUrl, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    'Password': password_from_user,
                    'Registered': 'FALSE',
                    'Last Updated': new Date().toISOString()
                })
            });

            if (!updateResponse.ok) {
                throw new Error(`API update responded with status ${updateResponse.status}`);
            }
             return { success: true, message: 'Signup successful! Please log in to update your details.', flatId };
        } 
        
        // Case 2: Flat does not exist in the sheet, create it.
        else {
             const newRowData = {
                'Flat ID': flatId,
                'Block': block,
                'Floor': floor,
                'Flat': flat,
                'Password': password_from_user,
                'Registered': 'FALSE',
                'Last Updated': new Date().toISOString(),
             };

             const createResponse = await fetch(SHEETDB_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: [newRowData] }) // SheetDB expects a 'data' property for POST
             });

             if (!createResponse.ok) {
                throw new Error(`API create responded with status ${createResponse.status}`);
             }

             return { success: true, message: 'Signup successful! Please log in to update your details.', flatId };
        }

    } catch (e: any) {
        return { success: false, message: handleApiError(e, 'process owner signup').message };
    }
}

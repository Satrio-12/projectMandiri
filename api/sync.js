import { put, list } from '@vercel/blob';

export default async function handler(request, response) {
    try {
        const BLOB_STORE_NAME = 'academic_control_data.json';

        if (request.method === 'GET') {
            // Read data
            const { blobs } = await list();
            const dataBlob = blobs.find(b => b.pathname === BLOB_STORE_NAME);
            
            if (dataBlob) {
                const res = await fetch(dataBlob.url);
                const data = await res.json();
                return response.status(200).json({ success: true, data });
            } else {
                return response.status(404).json({ success: false, message: 'Data not found' });
            }
        } 
        else if (request.method === 'POST') {
            // Write data
            const { data } = request.body;
            if (!data) {
                return response.status(400).json({ success: false, message: 'No data provided' });
            }

            // Put the new data, overriding any existing one with the same pathname (by default Vercel Blob adds a random suffix, to override we need to use addRandomSuffix: false)
            // Note: addRandomSuffix: false requires the blob token to have this permission (usually it does by default now)
            const blob = await put(BLOB_STORE_NAME, JSON.stringify(data), {
                access: 'public',
                addRandomSuffix: false, // Ensure we always overwrite the same file
            });

            return response.status(200).json({ success: true, url: blob.url });
        } 
        else {
            response.setHeader('Allow', ['GET', 'POST']);
            return response.status(405).json({ success: false, message: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error("Blob Sync Error:", error);
        return response.status(500).json({ success: false, message: error.message });
    }
}

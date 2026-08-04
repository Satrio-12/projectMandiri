import { put, list } from '@vercel/blob';

export default async function handler(request, response) {
    console.log(`[API] Terpanggil dengan method: ${request.method}`);
    try {
        const BLOB_STORE_NAME = 'academic_control_data.json';
        
        // Debugging Token:
        console.log(`[API] Token terbaca: ${process.env.BLOB_READ_WRITE_TOKEN ? "ADA (Panjang: " + process.env.BLOB_READ_WRITE_TOKEN.length + ")" : "TIDAK ADA!"}`);

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
            console.log(`[API] Menerima POST request, ukuran data: ${data ? JSON.stringify(data).length : 'KOSONG'}`);
            if (!data) {
                console.log("[API] Gagal: Tidak ada data");
                return response.status(400).json({ success: false, message: 'No data provided' });
            }

            console.log("[API] Mulai proses upload ke Blob...");
            // Tambahkan timeout manual agar tidak hang selamanya
            const uploadPromise = put(BLOB_STORE_NAME, JSON.stringify(data), {
                access: 'public',
                addRandomSuffix: false, // Ensure we always overwrite the same file
            });
            
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Vercel Blob SDK Timeout > 8s")), 8000));
            
            const blob = await Promise.race([uploadPromise, timeoutPromise]);
            
            console.log("[API] Upload berhasil! URL: " + blob.url);

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

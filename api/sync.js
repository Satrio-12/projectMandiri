export default async function handler(request, response) {
    console.log(`[API] Terpanggil dengan method: ${request.method}`);
    try {
        const BLOB_STORE_NAME = 'academic_control_data.json';
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        
        console.log(`[API] Token: ${token ? "ADA (" + token.substring(0, 15) + "...)" : "TIDAK ADA"}`);

        if (!token) {
            return response.status(500).json({ success: false, message: 'Server missing BLOB_READ_WRITE_TOKEN' });
        }

        if (request.method === 'GET') {
            console.log("[API] Mengambil data (GET)...");
            
            // Raw Fetch for GET (List Blobs)
            const listRes = await fetch(`https://blob.vercel-storage.com/?prefix=${BLOB_STORE_NAME}&limit=1`, {
                headers: { authorization: `Bearer ${token}`, 'x-api-version': '7' }
            });
            
            if (!listRes.ok) {
                const errTxt = await listRes.text();
                console.log("[API] Gagal List Blob:", listRes.status, errTxt);
                return response.status(listRes.status).json({ success: false, message: errTxt });
            }
            
            const listData = await listRes.json();
            const dataBlob = listData.blobs.find(b => b.pathname === BLOB_STORE_NAME);
            
            if (dataBlob) {
                const res = await fetch(dataBlob.url);
                const data = await res.json();
                console.log("[API] GET Berhasil!");
                return response.status(200).json({ success: true, data });
            } else {
                return response.status(404).json({ success: false, message: 'Data not found' });
            }
        } 
        else if (request.method === 'POST') {
            const { data } = request.body;
            console.log(`[API] Memulai POST, data ada? ${!!data}`);
            if (!data) return response.status(400).json({ success: false, message: 'No data' });

            console.log("[API] Mengirim native fetch PUT ke Vercel Blob...");
            
            // Raw Fetch for PUT (Upload)
            const putRes = await fetch(`https://blob.vercel-storage.com/${BLOB_STORE_NAME}`, {
                method: 'PUT',
                headers: {
                    'authorization': `Bearer ${token}`,
                    'x-api-version': '7',
                    'x-add-random-suffix': 'false',
                    'content-type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!putRes.ok) {
                const errTxt = await putRes.text();
                console.log("[API] Gagal Upload Blob:", putRes.status, errTxt);
                return response.status(putRes.status).json({ success: false, message: errTxt });
            }

            const putData = await putRes.json();
            console.log("[API] Upload Sukses! URL:", putData.url);
            
            return response.status(200).json({ success: true, url: putData.url });
        } 
        else {
            response.setHeader('Allow', ['GET', 'POST']);
            return response.status(405).json({ success: false, message: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error("[API] Error Kritis:", error);
        return response.status(500).json({ success: false, message: error.toString() });
    }
}

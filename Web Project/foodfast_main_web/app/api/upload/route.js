import { NextResponse } from 'next/server'

export async function POST(request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file')

        if (!file) {
            return NextResponse.json(
                { error: 'File is required' },
                { status: 400 }
            )
        }

        // Prepare imgBB upload
        const imgbbFormData = new FormData()
        imgbbFormData.append('image', file)
        imgbbFormData.append('key', process.env.NEXT_PUBLIC_IMGBB_API_KEY)

        // Upload to imgBB
        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: imgbbFormData
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error?.message || 'imgBB upload failed')
        }

        const data = await response.json()

        if (!data.data || !data.data.url) {
            console.error('Invalid imgBB response:', JSON.stringify(data, null, 2))
            throw new Error('Invalid response from imgBB: missing URL in response')
        }

        const downloadURL = data.data.url
        console.log('Successfully uploaded to imgBB:', downloadURL)

        return NextResponse.json({ downloadURL }, { status: 200 })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: error.message || 'Upload failed' },
            { status: 500 }
        )
    }
}

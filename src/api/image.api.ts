import axios from 'axios'

const api = axios.create({
    baseURL:"http://192.168.1.238:3030/api/v1",
    headers: {
        "Content-Type": "multipart/form-data",
        "Accept": "multipart/form-data"
    }
})

export const createImageDirectory = async () => {
    try {
        // In a Vite app, we don't need to create the directory as it's handled by the build process
        return { success: true }
    } catch (error) {
        console.error("Error creating image directory:", error)
        throw error
    }
}

export const saveImage = async (file: File) => {
    try {
        const formData = new FormData()
        formData.append('image', file)
        
        const response = await api.post('/questions/upload-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        
        return response.data
    } catch (error) {
        console.error("Error uploading image:", error)
        throw error
    }
} 
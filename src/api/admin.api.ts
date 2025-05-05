import axios from 'axios'

interface Question {
    question: string;
    options: string[];
    answer: number;
    topic: string;
    subject: string;
    level: string;
    image?: string;
}

interface BulkQuestionsResponse {
    message: string;
    questions: Question[];
}

const api =axios.create({
    baseURL:"http://localhost:3030/api/v1",
    headers:{
        "Content-Type":"application/json",
        "Accept":"application/json"
    }
})

export const getCardData = async (level:string) => {
    try{
        const response = await api.get(`/admin/statistics/${level}`)
        console.log("Card data:",response.data)
        return response.data
    }catch(error){
        console.error("Error fetching card data:",error)
        throw error
    }
}

export const getStudents = async (level:string) => {
    try{
        const response = await api.get(`/admin/students/${level}`)
        console.log("level:",level)
        return response.data
    }catch(error){
        console.error("Error fetching students:",error)
        throw error
    }
}

export const addQuestions = async (data: { questions: Question[] }): Promise<BulkQuestionsResponse> => {
    try{
        const response = await api.post("/questions/bulk", data)
        console.log("response:",response.data)
        return response.data
    }catch(error){
        console.error("Error adding questions:",error)
        throw error
    }
}

export const addAQuestion = async (data:Question) => {
    try{
        const response = await api.post("/questions",data)
        console.log("response:",response.data)
        return response.data
    }catch(error){
        console.error("Error adding question:",error)
        throw error
    }
}

export const uploadImage = async (file: File): Promise<{ url: string }> => {
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

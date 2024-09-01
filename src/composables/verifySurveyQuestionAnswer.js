import ServiceResponse from '../services/Response'
const service_response = new ServiceResponse()
const bd_service_response = service_response.getFuentesData()

export default async function verifySurveyQuestionAnswer(idEncuesta,idQuestion,idAnswer) {

    try {

        const where = {
            IdEncuesta: idEncuesta,
            IdQuestion:idQuestion,
            IdAnswer:idAnswer

        }
    
        await service_response.unique({ params: where })
     
        if (bd_service_response.value.length > 0) return true

    } catch (error) {
        
        console.error(error)
    }


}
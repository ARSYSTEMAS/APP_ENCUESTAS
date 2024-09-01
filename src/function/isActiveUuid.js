import UuidService from "../services/GenerateUUID"
export default async function isActiveUuid(uuid) {

const Uuid_Service = new UuidService()
await Uuid_Service.Uuid(uuid)
const Bd   =  Uuid_Service.getFuentesData()
return  Bd.value?.length > 0 ? true : false

}
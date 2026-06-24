import {
    selectOauthCuentas, selectOauthCuentasById,
    insertOauthCuentas, updateOauthCuentas, deleteOauthCuentas
} from "../models/oauth_cuentas.js";

const getOauthCuentas = async (req, res) => {
    try {

        const listaOauthCuentas = await selectOauthCuentas();

        if (listaOauthCuentas.length === 0) {
            return res.status(404).json({ message: "Lista de oauth cuentas no encontrado" });
        }

        res.status(200).json(listaOauthCuentas)

    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ message: 'Error del servidor' })
    }
}

const getOauthCuentasById = async (req, res) => {
    try {

        const { id } = req.params;

        if (!id) {
            return res.status(404).json({ message: 'Id no encontrado' })
        }

        const oauthCuentasId = await selectOauthCuentasById(id);

        if (!oauthCuentasId) {
            return res.status(404).json({ message: "Oauth cuenta no encontrada" })
        }

        res.status(200).json(oauthCuentasId);
    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: 'Error del servidor' })
    }
}

const postOauthCuentas = async (req, res) => {
    try {

        const { usu_id, proveedor, provider_uid } = req.body;

        if (!usu_id || !proveedor || !provider_uid) {
            return res.status(400).json({ message: "Campos no encontrados" })
        }

        const nuevaOauthCuenta = await insertOauthCuentas({ usu_id, proveedor, provider_uid });

        res.status(201).json({
            id: nuevaOauthCuenta.id,
            usu_id: nuevaOauthCuenta.usu_id,
            proveedor: nuevaOauthCuenta.proveedor,
            provider_uid: nuevaOauthCuenta.provider_uid
        })

    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: 'Error del servidor' })
    }
}

const putOauthCuentas = async (req, res) => {
    try {

        const { id } = req.params;

        const { usu_id, proveedor, provider_uid } = req.body;

        if (!id) {
            return res.status(404).json({ message: "Id no encontrado" })
        }

        const oauthCuentasId = await updateOauthCuentas(id, { usu_id, proveedor, provider_uid })

        if(!oauthCuentasId){
            return res.status(404).json({ message: "Datos no validados"})
        }

        res.status(200).json({
            id: oauthCuentasId.id,
            usu_id: oauthCuentasId.usu_id,
            proveedor: oauthCuentasId.proveedor,
            provider_uid: oauthCuentasId.provider_uid
        })

    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: 'Error del servidor' })
    }
}

const dltOauthCuentas = async (req, res) => {
    try {

        const { id } = req.params;

        if(!id){
            return res.status(404).json({ message:  "Id no encontrado"})
        }

        const oauthCuentasDlt = await  deleteOauthCuentas(id);

        if(!oauthCuentasDlt){
            return res.status(404).json({ message : "Oauth cuenta no encontrad"})
        }

        res.status(200).json(oauthCuentasDlt);

    } catch (error) {
        console.error('Error: ', error)
        res.status(500).json({ message: 'Error del servidor' })
    }
}

export { getOauthCuentas, getOauthCuentasById, postOauthCuentas, putOauthCuentas, dltOauthCuentas};

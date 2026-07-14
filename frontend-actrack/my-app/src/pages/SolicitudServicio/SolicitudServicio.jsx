import { useState, useEffect } from "react"
import { Card } from "../../components/Card";
import { AuthContext } from '../../context/AuthContext'

const SolicitudServicio = () => {

    const [listaEquipos, setListaEquipos] = useState("");
    const [equipoElegido, setEquipoELegido] = useState("");
    const [listaCategorias, setListaCategorias] = useState("");
    const [categoriaElegida, setCategoriaElegida] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [fecha, setFecha] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { apiFetch } = AuthContext();

    useEffect = (() => {

    }, [])

    return (
        <>
            <Card>
                <h1>Crear Orden de Solciitud</h1>
                <select value={} onChange={}> 
                    <option></option>
                </select>
                
            </Card>
        </>
    )




}

export default SolicitudServicio
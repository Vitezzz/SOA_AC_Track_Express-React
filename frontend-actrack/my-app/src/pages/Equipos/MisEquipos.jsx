import { Card } from "../../components/Card.jsx";
import Table from '../../components/Table.jsx'

const MisEquipos = () => {

    const devices = [{id : 1 ,marca: 'Midea', modelo:'MS12CR', numero_serie:'AC-001-2024-XA32',
        tipo:'Split Pared'
    },{id: 2, marca: 'LG', modelo:'LS18HS', numero_serie:'AC-002-2024-BT91',
        tipo:'Split Inverter'
    }]

    return(
        <>
        <h2>Mis Equipos</h2>
        <Card>
            <Table object={devices}/>
        </Card>
        </>
    );
}

export default MisEquipos;
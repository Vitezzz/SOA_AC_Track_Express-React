export const ROLES = {
    ADMIN: 2,
    CLIENTE: 3,
    TECNICO: 4,
    SUPERVISOR: 5
}

export const puedeVerTodo = (rol_id) => {
    return rol_id === ROLES.ADMIN || rol_id === ROLES.SUPERVISOR
}

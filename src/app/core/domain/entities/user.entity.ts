export interface UserEntity {
  uid?: string
  nombre: string
  apellido: string
  telefono: string
  email: string
  fcmToken?: string
}

export interface ContactEntity {
  uid: string
  nombre: string
  apellido: string
  telefono: string
  fcmToken?: string
}

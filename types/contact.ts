export interface ContactFormValues {
  name: string
  email: string
  subject: string
  message: string
}

export interface ContactMessageResult {
  message?: string
  id?: string
}

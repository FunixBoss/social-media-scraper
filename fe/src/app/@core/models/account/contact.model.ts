
export class Contact {
    contactId: number;
    email: string;
    fullName: string
    phoneNumber: string
    subject: string
    message: string
    createdAt: Date
}

export class GetContactResponse { 
    _embedded: {
        contacts: Contact[]
    }
}
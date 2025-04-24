import { InjectionToken } from "@angular/core"
import type { AuthRepository } from "../repositories/auth.repository"
import type { ContactRepository } from "../repositories/contact.repository"
import type { NotificationRepository } from "../repositories/notification.repository"

export const AUTH_REPOSITORY = new InjectionToken<AuthRepository>("AuthRepository")
export const CONTACT_REPOSITORY = new InjectionToken<ContactRepository>("ContactRepository")
export const NOTIFICATION_REPOSITORY = new InjectionToken<NotificationRepository>("NotificationRepository")

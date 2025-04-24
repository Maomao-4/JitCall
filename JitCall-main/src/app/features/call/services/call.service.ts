import { Injectable } from "@angular/core"
import { CallUseCase } from "../../../core/application/use-cases/call.use-case"
import { ContactEntity } from "../../../core/domain/entities/user.entity"

@Injectable({
  providedIn: "root",
})
export class CallService {
  constructor(private callUseCase: CallUseCase) {}

  async initiateCall(contact: ContactEntity): Promise<string | null> {
    return this.callUseCase.initiateCall(contact)
  }

  getJitsiMeetUrl(meetingId: string): string {
    return this.callUseCase.getJitsiMeetUrl(meetingId)
  }

  async joinJitsiMeeting(meetingId: string): Promise<void> {
    return this.callUseCase.joinJitsiMeeting(meetingId)
  }
}

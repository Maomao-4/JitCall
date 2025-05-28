import { Component, Input, OnInit, OnDestroy } from "@angular/core"
import { ModalController } from "@ionic/angular"

@Component({
  selector: "app-incoming-call",
  templateUrl: "./incoming-call.component.html",
  styleUrls: ["./incoming-call.component.scss"],
  standalone: false,
})
export class IncomingCallComponent implements OnInit, OnDestroy {
  @Input() userFrom!: string
  @Input() name!: string
  @Input() meetingId!: string

  callTimer = "00:00"
  private timerInterval: any
  private seconds = 0

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    this.startTimer()
  }

  ngOnDestroy() {
    this.clearTimer()
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.seconds++
      const minutes = Math.floor(this.seconds / 60)
      const remainingSeconds = this.seconds % 60
      this.callTimer = `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    }, 1000)
  }

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
    }
  }

  getInitials(fullName: string): string {
    if (!fullName) return ""

    const parts = fullName.split(" ")
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
    }
    return fullName.charAt(0).toUpperCase()
  }

  dismiss() {
    this.clearTimer()
    this.modalCtrl.dismiss()
  }

  answerCall() {
    this.clearTimer()
    window.open(`https://meet.jit.si/${this.meetingId}`, "_self")
    this.modalCtrl.dismiss()
  }
}

"use client";

import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  encodePassphrase,
  generateRoomId,
  randomString,
} from "@/lib/client-utils";
import { Dialog } from "@radix-ui/react-dialog";
import { Copy } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MouseEventHandler, useState } from "react";
import { toast } from "sonner";
import styles from "../styles/Home.module.css";

export default function Page() {
  const router = useRouter();
  const [e2ee, setE2ee] = useState(false);
  const [sharedPassphrase, setSharedPassphrase] = useState(randomString(64));

  const [meetingLink, setMeetingLink] = useState("");
  const [meetingSchedule, setMeetingSchedule] = useState("");
  const [open, setOpen] = useState(false);

  const startMeeting = () => {
    if (e2ee) {
      router.push(
        `/rooms/${generateRoomId()}#${encodePassphrase(sharedPassphrase)}`
      );
    } else {
      router.push(`/rooms/${generateRoomId()}`);
    }
  };

  const onScheduleMeeting = () => {
    setMeetingSchedule(`${location.origin}/rooms/${generateRoomId()}`);
    setOpen(true);
  };

  const onCopyScheduledMeeting: MouseEventHandler = (e) => {
    e.preventDefault();
    window.navigator.clipboard.writeText(meetingSchedule);
    toast.success("Copied meeting link");
  };

  return (
    <main className={styles.main} data-lk-theme="default">
      <section className="max-w-xl text-center flex flex-col items-center justify-center h-screen">
        <Image
          className="mb-18"
          src={process.env.NEXT_PUBLIC_HOST_IMAGE || "/images/garth.png"}
          width={300}
          height={300}
          alt="logo"
        />
        <div className="p-1">
          <h1 className="text-3xl font-semibold md:text-4xl">
            Video Calls With AI Agents
          </h1>
          <p className="text-xl mt-4">lets dev stuff</p>
        </div>
        <div className="flex flex-col">
          <div className="flex flex-col mt-8 gap-4 justify-center w-full md:flex-row md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger className="lk-button">
                New Meeting
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="py-3 px-4 text-base"
                    onClick={startMeeting}
                  >
                    Start meeting now
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="py-3 px-4 text-base"
                    onClick={onScheduleMeeting}
                  >
                    Create meeting for later
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="w-full flex md:w-auto justify-between items-center">
              <input
                className="lk-form-control w-auto flex-grow"
                type="text"
                placeholder="Enter a link"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
              <span
                className="ml-2 cursor-pointer hover:text-white/80"
                onClick={() => {
                  if (meetingLink) {
                    router.push(meetingLink);
                  }
                }}
              >
                Join
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-6 justify-items-start">
            <div className="flex flex-row gap-4">
              <input
                id="use-e2ee"
                type="checkbox"
                checked={e2ee}
                onChange={(ev) => setE2ee(ev.target.checked)}
              />
              <Label htmlFor="use-e2ee">Enable end-to-end encryption</Label>
            </div>
            {e2ee && (
              <div className="flex flex-row gap-4">
                <Label htmlFor="passphrase">Passphrase</Label>
                <input
                  id="passphrase"
                  type="password"
                  value={sharedPassphrase}
                  onChange={(ev) => setSharedPassphrase(ev.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </section>
      <Dialog open={open} onOpenChange={(open) => setOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule a Meeting</DialogTitle>
            <DialogDescription>
              Anyone who has this link will be able to view this.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input id="link" value={meetingSchedule} readOnly />
            </div>
            <Button
              type="submit"
              size="sm"
              className="px-3"
              onClick={onCopyScheduledMeeting}
            >
              <span className="sr-only">Copy</span>
              <Copy />
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

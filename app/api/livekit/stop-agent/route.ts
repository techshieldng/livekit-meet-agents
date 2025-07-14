import { NextRequest, NextResponse } from "next/server";
import {
  AgentDispatchClient,
  // RoomServiceClient
} from "livekit-server-sdk";

export async function DELETE(request: NextRequest) {
  try {
    const roomName = request.nextUrl.searchParams.get("room-name");
    const agentName = process.env.NEXT_PUBLIC_AGENT_NAME || "livekit-agent";

    console.log("stopping agent...");
    console.log("roomName:", roomName);
    console.log("agentName:", agentName);

    if (!roomName) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 }
      );
    }

    if (!agentName) {
      return NextResponse.json(
        { error: "Agent name is required" },
        { status: 400 }
      );
    }

    const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL } = process.env;

    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
      return NextResponse.json(
        { error: "Server configuration is missing" },
        { status: 500 }
      );
    }

    // const roomServiceClient = new RoomServiceClient(
    //   LIVEKIT_URL,
    //   LIVEKIT_API_KEY,
    //   LIVEKIT_API_SECRET
    // );
    // const listParticipants = await roomServiceClient.listParticipants(roomName);
    // console.log("listParticipants:", listParticipants);
    // const participant = listParticipants.find(
    //   (participant) =>
    //     participant.kind === 4 &&
    //     participant.attributes?.agentName === agentName
    // );
    // if (participant) {
    //   await roomServiceClient.removeParticipant(roomName, participant.identity);
    // } else {
    //   return NextResponse.json(
    //     { error: "Agent participant not found in the room" },
    //     { status: 404 }
    //   );
    // }

    const agentDispatchClient = new AgentDispatchClient(
      LIVEKIT_URL,
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET
    );

    const dispatches = await agentDispatchClient.listDispatch(roomName);
    if (dispatches.length === 0) {
      return NextResponse.json(
        { error: "No dispatches found for the room" },
        { status: 404 }
      );
    }

    const dispatchId = dispatches.find(
      (dispatch) => dispatch.agentName === agentName
    )?.id;
    if (dispatchId) {
      await agentDispatchClient.deleteDispatch(dispatchId, roomName);
    } else {
      return NextResponse.json(
        { error: "Agent dispatch not found for the room" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Agent dispatch has been deleted for the room",
    });
  } catch (error) {
    console.error("Error stopping agent:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

import logging

from dotenv import load_dotenv

from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    JobRequest,
    JobProcess,
    RoomOutputOptions,
    WorkerOptions,
    WorkerType,
    cli,
)
from livekit.plugins import bey, openai, silero, deepgram, cartesia
from livekit.plugins.turn_detector.english import EnglishModel

logger = logging.getLogger("bey-avatar-example")
logger.setLevel(logging.INFO)

load_dotenv()

AVATAR_DISPLAY_NAME = "Michael"

async def entrypoint(ctx: JobContext):
    await ctx.connect()

    session = AgentSession(
        vad=ctx.proc.userdata["vad"],
        llm=openai.LLM(model="gpt-4.1"),
        stt=deepgram.STT(model="nova-3", language="en-US"),
        tts=cartesia.TTS(voice="729651dc-c6c3-4ee5-97fa-350da1f88600"),
        turn_detection=EnglishModel(),
        max_tool_steps=10,
    )

    avatar_id = "b9be11b8-89fb-4227-8f86-4a881393cbdb"
    bey_avatar = bey.AvatarSession(
        avatar_id=avatar_id,
        avatar_participant_name=AVATAR_DISPLAY_NAME,
        avatar_participant_identity="bey-avatar-agent"
    )
    await bey_avatar.start(session, room=ctx.room)

    await session.start(
        agent=Agent(instructions="Talk to me!"),
        room=ctx.room,
        # audio is forwarded to the avatar, so we disable room audio output
        room_output_options=RoomOutputOptions(audio_enabled=False),
    )
    session.generate_reply(instructions="Say something similar to 'Hey I'm Michael, how can I help you today?'")


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


async def request_fnc(req: JobRequest):
    await req.accept(
        attributes={"agentType": "avatar"},
    )


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            worker_type=WorkerType.ROOM,
            prewarm_fnc=prewarm,
            request_fnc=request_fnc,
            agent_name="livekit-agent" # used to request the agent
        )
    )
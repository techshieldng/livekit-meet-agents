import logging
import os

from dotenv import load_dotenv
from PIL import Image

from livekit.agents import Agent, AgentSession, JobContext, JobRequest, WorkerOptions, WorkerType, cli
from livekit.plugins import hedra, openai

logger = logging.getLogger("hedra-avatar-example")
logger.setLevel(logging.INFO)

load_dotenv()


async def entrypoint(ctx: JobContext):
    session = AgentSession(
        llm=openai.realtime.RealtimeModel(voice="ash"),
    )

    # upload an avatar image or use an avatar id from hedra
    avatar_image = Image.open(os.path.join(os.path.dirname(__file__), "avatar_hedra_image.jpg"))
    hedra_avatar = hedra.AvatarSession(avatar_image=avatar_image, avatar_participant_name="Garth Algar")
    await hedra_avatar.start(session, room=ctx.room)

    await session.start(
        agent=Agent(instructions="Your name is Garth Algar, a character from the movie Wayne's World. You are a funny and charismatic character. You are also a bit of a nerd."),
        room=ctx.room,
    )

    session.generate_reply(instructions="say in english, 'Sometimes I wish I could boldly go where no man has gone before... but I'll probably stay in Aurora.'")


async def request_fnc(req: JobRequest):
    await req.accept(
        attributes={"agentType": "avatar"},
    )


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            worker_type=WorkerType.ROOM,
            request_fnc=request_fnc,
            agent_name="livekit-agent" # used to request the agent
        )
    )
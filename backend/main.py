from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import date
import os

load_dotenv()

# ── Supabase client ──────────────────────────────────────────────────────────
supabase: Client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_KEY"],
)

# ── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Members API",
    description="CRUD API for the Members registry, backed by Supabase.",
    version="1.0.0",
)

router = APIRouter(prefix="/api")

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    os.environ.get("FRONTEND_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in ALLOWED_ORIGINS if o],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Schemas ──────────────────────────────────────────────────────────────────
class MemberCreate(BaseModel):
    first_name: str = Field(..., min_length=1, examples=["John"])
    last_name: str  = Field(..., min_length=1, examples=["Smith"])
    date_of_birth: date = Field(..., examples=["1990-05-15"])

class Member(MemberCreate):
    id: str
    created_at: str

# ── Routes ───────────────────────────────────────────────────────────────────
@router.get(
    "/members",
    response_model=list[Member],
    summary="List all members",
    tags=["Members"],
)
def get_members():
    """Return all members ordered by most recently added."""
    response = (
        supabase.table("members")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return response.data


@router.post(
    "/members",
    response_model=Member,
    status_code=201,
    summary="Create a member",
    tags=["Members"],
)
def create_member(payload: MemberCreate):
    """Add a new member to the registry."""
    response = (
        supabase.table("members")
        .insert({
            "first_name": payload.first_name,
            "last_name":  payload.last_name,
            "date_of_birth": str(payload.date_of_birth),
        })
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=500, detail="Insert failed")
    return response.data[0]


@router.delete(
    "/members/{member_id}",
    status_code=204,
    summary="Delete a member",
    tags=["Members"],
)
def delete_member(member_id: str):
    """Delete a member by their UUID."""
    response = (
        supabase.table("members")
        .delete()
        .eq("id", member_id)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Member not found")


app.include_router(router)

-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('CREDENTIAL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "CollabStatusType" AS ENUM ('PENDING', 'ACCEPTED');

-- CreateEnum
CREATE TYPE "EngagementVoteType" AS ENUM ('BOOST', 'REDUCE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('COLLAB_INVITE', 'COLLAB_ACCEPTED', 'COLLAB_REJECTED', 'NEW_DISCUSSION', 'DISCUSSION_REPLY', 'USER_MENTION', 'ARTIFACT_BOOST', 'ARTIFACT_AMPLIFY', 'NEW_WATCHER', 'GUILD_ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('FREELANCE', 'OPEN_TO_WORK', 'EMPLOYED', 'NONE');

-- CreateTable
CREATE TABLE "User" (
    "id" CHAR(26) NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255),
    "auth_type" "AuthType" NOT NULL DEFAULT 'CREDENTIAL',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(255) NOT NULL,
    "job_title" VARCHAR(255),
    "job_status" "JobStatus" DEFAULT 'NONE',
    "bio" TEXT,
    "github" VARCHAR(255),
    "linkedin" VARCHAR(255),
    "photo_profile_id" CHAR(26),
    "count_artifacts" INTEGER NOT NULL DEFAULT 0,
    "count_watcher" INTEGER NOT NULL DEFAULT 0,
    "count_watchlist" INTEGER NOT NULL DEFAULT 0,
    "count_amplify" INTEGER NOT NULL DEFAULT 0,
    "count_collection" INTEGER NOT NULL DEFAULT 0,
    "count_discussion" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationOtp" (
    "id" CHAR(26) NOT NULL,
    "user_id" CHAR(26) NOT NULL,
    "otp_code" VARCHAR(10) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Watchlist" (
    "id" CHAR(26) NOT NULL,
    "watcher_id" CHAR(26) NOT NULL,
    "watched_id" CHAR(26) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" CHAR(26) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "owner_id" CHAR(26) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "cover_image" VARCHAR(255),
    "icon" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildSubscription" (
    "id" CHAR(26) NOT NULL,
    "user_id" CHAR(26) NOT NULL,
    "guild_id" CHAR(26) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artifact" (
    "id" CHAR(26) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "author_id" CHAR(26) NOT NULL,
    "guild_id" CHAR(26),
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "count_boosts" INTEGER NOT NULL DEFAULT 0,
    "count_reduces" INTEGER NOT NULL DEFAULT 0,
    "count_comments" INTEGER NOT NULL DEFAULT 0,
    "count_amplifies" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Artifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collaboration" (
    "id" CHAR(26) NOT NULL,
    "user_id" CHAR(26) NOT NULL,
    "artifact_id" CHAR(26) NOT NULL,
    "status" "CollabStatusType" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Collaboration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" CHAR(26) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtifactTag" (
    "artifact_id" CHAR(26) NOT NULL,
    "tag_id" CHAR(26) NOT NULL,

    CONSTRAINT "ArtifactTag_pkey" PRIMARY KEY ("artifact_id","tag_id")
);

-- CreateTable
CREATE TABLE "Discussion" (
    "id" CHAR(26) NOT NULL,
    "user_id" CHAR(26) NOT NULL,
    "artifact_id" CHAR(26) NOT NULL,
    "parent_id" CHAR(26),
    "content" TEXT NOT NULL,
    "count_boosts" INTEGER NOT NULL DEFAULT 0,
    "count_reduces" INTEGER NOT NULL DEFAULT 0,
    "count_replies" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Discussion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" CHAR(26) NOT NULL,
    "user_id" CHAR(26) NOT NULL,
    "artifact_id" CHAR(26) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Amplify" (
    "id" CHAR(26) NOT NULL,
    "user_id" CHAR(26) NOT NULL,
    "artifact_id" CHAR(26) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Amplify_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngagementArtifact" (
    "id" CHAR(26) NOT NULL,
    "user_id" CHAR(26) NOT NULL,
    "artifact_id" CHAR(26) NOT NULL,
    "type" "EngagementVoteType" NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EngagementArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngagementDiscussion" (
    "id" CHAR(26) NOT NULL,
    "user_id" CHAR(26) NOT NULL,
    "discussion_id" CHAR(26) NOT NULL,
    "type" "EngagementVoteType" NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EngagementDiscussion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" CHAR(26) NOT NULL,
    "user_id" CHAR(26) NOT NULL,
    "actor_id" CHAR(26),
    "type" "NotificationType" NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "actor_count" INTEGER NOT NULL DEFAULT 1,
    "last_actor_id" CHAR(26),
    "artifact_id" CHAR(26),
    "discussion_id" CHAR(26),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" CHAR(26) NOT NULL,
    "artifact_id" CHAR(26),
    "url" VARCHAR(255) NOT NULL,
    "size" INTEGER NOT NULL DEFAULT 0,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_photo_profile_id_key" ON "User"("photo_profile_id");

-- CreateIndex
CREATE INDEX "idx_user_username" ON "User"("username");

-- CreateIndex
CREATE INDEX "idx_otp_user_id" ON "VerificationOtp"("user_id");

-- CreateIndex
CREATE INDEX "idx_watchlist_watcher" ON "Watchlist"("watcher_id");

-- CreateIndex
CREATE INDEX "idx_watchlist_watched" ON "Watchlist"("watched_id");

-- CreateIndex
CREATE UNIQUE INDEX "Watchlist_watcher_id_watched_id_key" ON "Watchlist"("watcher_id", "watched_id");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_slug_key" ON "Guild"("slug");

-- CreateIndex
CREATE INDEX "idx_guild_owner_id" ON "Guild"("owner_id");

-- CreateIndex
CREATE INDEX "idx_guild_sub_guild_id" ON "GuildSubscription"("guild_id");

-- CreateIndex
CREATE UNIQUE INDEX "GuildSubscription_user_id_guild_id_key" ON "GuildSubscription"("user_id", "guild_id");

-- CreateIndex
CREATE UNIQUE INDEX "Artifact_slug_key" ON "Artifact"("slug");

-- CreateIndex
CREATE INDEX "idx_artifact_author_id" ON "Artifact"("author_id");

-- CreateIndex
CREATE INDEX "idx_artifact_guild_id" ON "Artifact"("guild_id");

-- CreateIndex
CREATE INDEX "idx_collab_artifact_id" ON "Collaboration"("artifact_id");

-- CreateIndex
CREATE UNIQUE INDEX "Collaboration_user_id_artifact_id_key" ON "Collaboration"("user_id", "artifact_id");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "idx_discussion_artifact_id" ON "Discussion"("artifact_id");

-- CreateIndex
CREATE INDEX "idx_discussion_user_id" ON "Discussion"("user_id");

-- CreateIndex
CREATE INDEX "idx_discussion_parent_id" ON "Discussion"("parent_id");

-- CreateIndex
CREATE INDEX "idx_collection_user_id" ON "Collection"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_user_id_artifact_id_key" ON "Collection"("user_id", "artifact_id");

-- CreateIndex
CREATE INDEX "idx_amplify_user_id" ON "Amplify"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Amplify_user_id_artifact_id_key" ON "Amplify"("user_id", "artifact_id");

-- CreateIndex
CREATE INDEX "idx_eng_artifact_id" ON "EngagementArtifact"("artifact_id");

-- CreateIndex
CREATE UNIQUE INDEX "EngagementArtifact_user_id_artifact_id_key" ON "EngagementArtifact"("user_id", "artifact_id");

-- CreateIndex
CREATE INDEX "idx_eng_discussion_id" ON "EngagementDiscussion"("discussion_id");

-- CreateIndex
CREATE UNIQUE INDEX "EngagementDiscussion_user_id_discussion_id_key" ON "EngagementDiscussion"("user_id", "discussion_id");

-- CreateIndex
CREATE INDEX "idx_notification_user_id" ON "Notification"("user_id");

-- CreateIndex
CREATE INDEX "idx_notification_is_read" ON "Notification"("is_read");

-- CreateIndex
CREATE INDEX "idx_notification_updated_at" ON "Notification"("updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_user_id_type_artifact_id_key" ON "Notification"("user_id", "type", "artifact_id");

-- CreateIndex
CREATE INDEX "idx_media_artifact_id" ON "Media"("artifact_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_photo_profile_id_fkey" FOREIGN KEY ("photo_profile_id") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationOtp" ADD CONSTRAINT "VerificationOtp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_watcher_id_fkey" FOREIGN KEY ("watcher_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_watched_id_fkey" FOREIGN KEY ("watched_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guild" ADD CONSTRAINT "Guild_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildSubscription" ADD CONSTRAINT "GuildSubscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildSubscription" ADD CONSTRAINT "GuildSubscription_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artifact" ADD CONSTRAINT "Artifact_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "Guild"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaboration" ADD CONSTRAINT "Collaboration_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactTag" ADD CONSTRAINT "ArtifactTag_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactTag" ADD CONSTRAINT "ArtifactTag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discussion" ADD CONSTRAINT "Discussion_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Discussion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Amplify" ADD CONSTRAINT "Amplify_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Amplify" ADD CONSTRAINT "Amplify_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementArtifact" ADD CONSTRAINT "EngagementArtifact_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementArtifact" ADD CONSTRAINT "EngagementArtifact_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementDiscussion" ADD CONSTRAINT "EngagementDiscussion_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementDiscussion" ADD CONSTRAINT "EngagementDiscussion_discussion_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "Discussion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_discussion_id_fkey" FOREIGN KEY ("discussion_id") REFERENCES "Discussion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_last_actor_id_fkey" FOREIGN KEY ("last_actor_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

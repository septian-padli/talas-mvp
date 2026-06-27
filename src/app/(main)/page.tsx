import CreatePostCard from "@/components/CreatePostCard";
import { ArtifactCard } from "@/components/artifact";
import Divider from "@/components/ui/divider";

export default function Home() {
  return (
    <>
      <CreatePostCard />
      <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 space-y-8">
        <ArtifactCard />
        <Divider />
        <ArtifactCard />

      </div>
    </>
  );
}

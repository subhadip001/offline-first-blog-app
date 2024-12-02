import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePosts } from "@/hooks/usePosts";
import { Post } from "@/lib/types";
import { Edit } from "lucide-react";

interface UpdatePostDialogProps {
  post: Post;
}

export function UpdatePostDialog({ post }: UpdatePostDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const { updatePostMutation, isOnline } = usePosts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updateData = {
      id: post.id,
      title,
      content,
    };

    try {
      if (!isOnline) {
        // updatePostOffline(updateData);
      } else {
        await updatePostMutation.mutateAsync(updateData);
      }
      setOpen(false);
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Make changes to your post here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title"
                required
              />
            </div>
            <div className="space-y-2">
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post content here..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={updatePostMutation.isPending}
            >
              {updatePostMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

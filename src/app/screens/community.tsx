import { useState } from "react"
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Textarea } from "../../components/ui/textarea"
import {
  Heart,
  MessageCircle,
  Shield,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react"
import { Badge } from "../../components/ui/badge"

interface Post {
  id: string
  author: string
  avatar: string
  timeAgo: string
  content: string
  likes: number
  comments: number
  tags: string[]
  isSupported?: boolean
}

export function CommunityScreen() {
  const [posts] = useState<Post[]>([
    {
      id: "1",
      author: "Sister Ama",
      avatar: "👑",
      timeAgo: "2h ago",
      content:
        "Just got my PCOS diagnosis confirmed. Feeling overwhelmed but grateful I found this community. Any tips for managing symptoms naturally?",
      likes: 24,
      comments: 12,
      tags: ["Newly Diagnosed", "Support"],
    },
    {
      id: "2",
      author: "Queen Efua",
      avatar: "✨",
      timeAgo: "5h ago",
      content:
        "Update: Been following the kontomire and beans diet for 3 weeks. My energy is SO much better! Period came on time for first time in months 🎉",
      likes: 45,
      comments: 18,
      tags: ["Success Story", "Nutrition"],
      isSupported: true,
    },
    {
      id: "3",
      author: "Akosua D",
      avatar: "💫",
      timeAgo: "8h ago",
      content:
        "Has anyone else struggled with family not understanding PCOS? My mom keeps saying I just need to exercise more. It's frustrating.",
      likes: 32,
      comments: 24,
      tags: ["Mental Health", "Family"],
    },
  ])

  const [showNewPost, setShowNewPost] = useState(false)

  return (
    <div className="min-h-screen pb-4">
      <div className="bg-primary text-white px-6 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cysterhood</h1>
            <p className="text-xs text-white/80">Safe space for African women</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        <Card className="shadow-sm border-none bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">2.4K</p>
                <p className="text-xs text-muted-foreground">Members</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">847</p>
                <p className="text-xs text-muted-foreground">Stories</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">98%</p>
                <p className="text-xs text-muted-foreground">Support Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm mb-1">
                  Moderated Safe Space
                </h3>
                <p className="text-xs text-muted-foreground">
                  All posts are anonymous and AI-moderated for safety. Be kind,
                  supportive, and respectful.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {!showNewPost ? (
          <Button
            onClick={() => setShowNewPost(true)}
            className="w-full h-14 rounded-xl bg-primary hover:bg-primary/90"
          >
            <Plus className="w-5 h-5 mr-2" />
            Share Your Story
          </Button>
        ) : (
          <Card className="shadow-md border-none">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-3">Share with Cysterhood</h3>
              <Textarea
                placeholder="Share your thoughts, questions, or victories... (Anonymous)"
                className="min-h-[120px] mb-3 rounded-xl"
              />
              <div className="flex gap-2">
                <Button className="flex-1 rounded-xl bg-primary hover:bg-primary/90">
                  Post Anonymously
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowNewPost(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <TrendingUp className="w-4 h-4 text-accent" />
            <h3 className="font-semibold text-sm">Trending Topics</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "Natural Remedies",
              "Weight Management",
              "Mental Health",
              "Fertility",
              "Local Foods",
            ].map((topic) => (
              <Badge
                key={topic}
                variant="outline"
                className="border-primary/20 hover:bg-primary/5 cursor-pointer"
              >
                #{topic}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold px-1">Recent Stories</h3>

          {posts.map((post) => (
            <Card key={post.id} className="shadow-sm border-none">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg flex-shrink-0">
                    {post.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-sm">
                          {post.author}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {post.timeAgo}
                        </p>
                      </div>
                      {post.isSupported && (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          ✓ Supported
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-foreground mb-3 leading-relaxed">
                  {post.content}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-primary/5 text-primary text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-3 border-t border-border">
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-md border-none bg-primary text-white">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-1">You're Not Alone</h3>
            <p className="text-sm text-white/90">
              Join thousands of African women supporting each other
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm mb-2">
              Community Guidelines
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className="flex gap-2">
                <span>•</span> Be respectful and supportive
              </li>
              <li className="flex gap-2">
                <span>•</span> No medical advice - share experiences only
              </li>
              <li className="flex gap-2">
                <span>•</span> Respect everyone's privacy
              </li>
              <li className="flex gap-2">
                <span>•</span> Report inappropriate content
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
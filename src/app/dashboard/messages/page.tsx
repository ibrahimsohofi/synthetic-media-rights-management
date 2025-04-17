import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, PlusCircle, Send, Paperclip, MoreVertical, ChevronDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export const metadata: Metadata = {
  title: "Messages | SyntheticRights",
  description: "Communicate with creators, licensees, and the SyntheticRights team",
};

export default function MessagesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with creators, licensees, and support
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)] min-h-[600px]">
          {/* Conversations Sidebar */}
          <div className="lg:col-span-1 flex flex-col border rounded-lg overflow-hidden bg-background">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Conversations</h2>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <PlusCircle className="h-4 w-4" />
                  <span>New</span>
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search messages..."
                  className="pl-8 bg-muted/50"
                />
              </div>
            </div>

            <Tabs defaultValue="all" className="flex-1">
              <div className="px-4 pt-2">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                  <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
                  <TabsTrigger value="support" className="flex-1">Support</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="flex-1 overflow-auto">
                <div className="divide-y">
                  {mockConversations.map((conversation, index) => (
                    <button
                      key={conversation.id}
                      className={`w-full flex items-start p-4 gap-3 hover:bg-muted/50 text-left ${index === 0 ? 'bg-muted/80' : ''}`}
                    >
                      <Avatar>
                        <AvatarImage src={conversation.avatar} />
                        <AvatarFallback>{conversation.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <span className="font-medium truncate">{conversation.name}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{conversation.time}</span>
                        </div>
                        <p className="text-sm truncate text-muted-foreground">{conversation.lastMessage}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {conversation.type && (
                            <Badge variant="outline" className="h-5 text-xs">
                              {conversation.type}
                            </Badge>
                          )}
                          {conversation.unread > 0 && (
                            <Badge className="h-5 w-5 justify-center rounded-full bg-violet-500">
                              {conversation.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="unread" className="flex-1 overflow-auto">
                <div className="divide-y">
                  {mockConversations
                    .filter(c => c.unread > 0)
                    .map((conversation) => (
                      <button
                        key={conversation.id}
                        className="w-full flex items-start p-4 gap-3 hover:bg-muted/50 text-left"
                      >
                        <Avatar>
                          <AvatarImage src={conversation.avatar} />
                          <AvatarFallback>{conversation.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <span className="font-medium truncate">{conversation.name}</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{conversation.time}</span>
                          </div>
                          <p className="text-sm truncate text-muted-foreground">{conversation.lastMessage}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {conversation.type && (
                              <Badge variant="outline" className="h-5 text-xs">
                                {conversation.type}
                              </Badge>
                            )}
                            {conversation.unread > 0 && (
                              <Badge className="h-5 w-5 justify-center rounded-full bg-violet-500">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="support" className="flex-1 overflow-auto">
                <div className="divide-y">
                  {mockConversations
                    .filter(c => c.type === 'Support')
                    .map((conversation) => (
                      <button
                        key={conversation.id}
                        className="w-full flex items-start p-4 gap-3 hover:bg-muted/50 text-left"
                      >
                        <Avatar>
                          <AvatarImage src={conversation.avatar} />
                          <AvatarFallback>{conversation.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <span className="font-medium truncate">{conversation.name}</span>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{conversation.time}</span>
                          </div>
                          <p className="text-sm truncate text-muted-foreground">{conversation.lastMessage}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {conversation.type && (
                              <Badge variant="outline" className="h-5 text-xs">
                                {conversation.type}
                              </Badge>
                            )}
                            {conversation.unread > 0 && (
                              <Badge className="h-5 w-5 justify-center rounded-full bg-violet-500">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Message Area */}
          <div className="lg:col-span-2 flex flex-col border rounded-lg overflow-hidden bg-background">
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/avatars/sarah-johnson.jpg" />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">Sarah Johnson</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-5 text-xs">
                      Licensing
                    </Badge>
                    <span className="text-xs text-muted-foreground">Last active: 10m ago</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-end gap-2 max-w-[80%]">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/sarah-johnson.jpg" />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <div>
                  <div className="bg-muted p-3 rounded-lg rounded-bl-none">
                    <p className="text-sm">Hi there! I'm interested in licensing your AI-generated cityscape series for my architectural blog. Do you offer partial licensing for web-only usage?</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 block">10:32 AM</span>
                </div>
              </div>

              <div className="flex items-end gap-2 max-w-[80%] ml-auto flex-row-reverse">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/user-avatar.jpg" />
                  <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                <div>
                  <div className="bg-violet-500 text-white p-3 rounded-lg rounded-br-none">
                    <p className="text-sm">Hello Sarah! Thanks for your interest in my cityscape series. Yes, I do offer web-only licensing options that would be perfect for your blog.</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 block text-right">10:45 AM</span>
                </div>
              </div>

              <div className="flex items-end gap-2 max-w-[80%]">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/sarah-johnson.jpg" />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <div>
                  <div className="bg-muted p-3 rounded-lg rounded-bl-none">
                    <p className="text-sm">That's great! Could you share the pricing details for using 5-6 images from the series? My blog gets around 50,000 monthly visitors.</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 block">11:03 AM</span>
                </div>
              </div>

              <div className="flex items-end gap-2 max-w-[80%] ml-auto flex-row-reverse">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/user-avatar.jpg" />
                  <AvatarFallback>ME</AvatarFallback>
                </Avatar>
                <div>
                  <div className="bg-violet-500 text-white p-3 rounded-lg rounded-br-none">
                    <p className="text-sm">I've just sent you a licensing proposal for 6 images with web-only usage rights. You can review the full terms, pricing, and accept directly through the platform if it works for you.</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 block text-right">11:15 AM</span>
                </div>
              </div>

              <div className="flex items-center justify-center my-6">
                <Badge variant="outline" className="font-normal">
                  Licensing proposal sent • April 15, 2025
                </Badge>
              </div>

              <div className="flex items-end gap-2 max-w-[80%]">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/sarah-johnson.jpg" />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <div>
                  <div className="bg-muted p-3 rounded-lg rounded-bl-none">
                    <p className="text-sm">Thanks for sending this over. The terms look good, but I'm wondering if there's any flexibility on the attribution requirements?</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 block">Just now</span>
                </div>
              </div>
            </div>

            <div className="border-t p-4">
              <div className="flex items-center gap-2 mb-3">
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  <ChevronDown className="h-4 w-4" />
                  <span>Templates</span>
                </Button>
              </div>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  className="min-h-[80px]"
                />
                <Button className="self-end gap-1">
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Mock data for conversations
const mockConversations = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "/avatars/sarah-johnson.jpg",
    lastMessage: "Thanks for sending this over. The terms look good, but I'm wondering if there's any flexibility on the attribution requirements?",
    time: "Just now",
    unread: 1,
    type: "Licensing"
  },
  {
    id: 2,
    name: "Alex Martinez",
    avatar: "/avatars/alex-martinez.jpg",
    lastMessage: "I've detected a potential unauthorized use of your portrait series on a commercial website. Would you like me to prepare a detailed report?",
    time: "2h ago",
    unread: 0,
    type: "Detection"
  },
  {
    id: 3,
    name: "Tech Support",
    avatar: "/avatars/tech-support.jpg",
    lastMessage: "Your rights registration for 'Neon Dreams' has been successfully processed. The blockchain certificate is now available.",
    time: "Yesterday",
    unread: 0,
    type: "Support"
  },
  {
    id: 4,
    name: "Maya Wilson",
    avatar: "/avatars/maya-wilson.jpg",
    lastMessage: "I love your AI landscape series! I'm looking to commission a similar style for my upcoming book cover. Would you be available?",
    time: "2d ago",
    unread: 0,
    type: "Marketplace"
  },
  {
    id: 5,
    name: "Legal Team",
    avatar: "/avatars/legal-team.jpg",
    lastMessage: "We've prepared the DMCA takedown notice as requested. Please review the document and let us know if you'd like to proceed.",
    time: "Apr 12",
    unread: 2,
    type: "Support"
  },
  {
    id: 6,
    name: "David Chen",
    avatar: "/avatars/david-chen.jpg",
    lastMessage: "Thank you for approving the license! I've processed the payment and will include proper attribution as specified in our agreement.",
    time: "Apr 10",
    unread: 0,
    type: "Licensing"
  },
  {
    id: 7,
    name: "Billing Support",
    avatar: "/avatars/billing-support.jpg",
    lastMessage: "Your subscription has been successfully upgraded to the Pro plan. You now have access to advanced detection features and priority support.",
    time: "Apr 5",
    unread: 0,
    type: "Support"
  }
];

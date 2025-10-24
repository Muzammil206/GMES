"use client"

import { useState, useEffect } from "react"
import { X, MapPin, Calendar, Droplets, Users, DollarSign, Home, Building2, Send, Trash2 } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Image from "next/image"

export default function EventDetailsModal({ event, isOpen, onClose }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    if (isOpen && event) {
      fetchComments()
      fetchCurrentUser()
    }
  }, [isOpen, event])

  const fetchCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: userData } = await supabase.from("users").select("*").eq("user_id", user.id).single()
      setCurrentUser(userData)
    }
  }

  const fetchComments = async () => {
    if (!event) return

    try {
      setIsLoadingComments(true)
      const { data, error } = await supabase
        .from("flood_event_comments")
        .select("*")
        .eq("event_id", event.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching comments:", error)
        return
      }

      setComments(data || [])
    } catch (error) {
      console.error("Fetch comments error:", error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUser) return

    try {
      setIsSubmitting(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from("flood_event_comments")
        .insert({
          event_id: event.id,
          user_id: user.id,
          user_email: currentUser.email,
          user_name: `${currentUser.firstname} ${currentUser.lastname}`,
          comment: newComment.trim(),
        })
        .select()
        .single()

      if (error) {
        console.error("Error submitting comment:", error)
        toast.error("Failed to submit comment")
        return
      }

      setComments([data, ...comments])
      setNewComment("")
      toast.success("Comment added successfully!")
    } catch (error) {
      console.error("Submit comment error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      const { error } = await supabase.from("flood_event_comments").update({ is_deleted: true }).eq("id", commentId)

      if (error) {
        console.error("Error deleting comment:", error)
        toast.error("Failed to delete comment")
        return
      }

      setComments(comments.filter((c) => c.id !== commentId))
      toast.success("Comment deleted successfully!")
    } catch (error) {
      console.error("Delete comment error:", error)
      toast.error("An unexpected error occurred")
    }
  }

  if (!isOpen || !event) return null

  const floodImages = [event.flood_image_1, event.flood_image_2, event.flood_image_3].filter(Boolean)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card rounded-2xl shadow-2xl max-w-6xl w-full my-8 border border-border">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary/10 to-transparent p-6 border-b border-border flex items-center justify-between rounded-t-2xl backdrop-blur-sm">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Flood Event Details</h2>
            <p className="text-muted-foreground">Event ID: #{event.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Flood Images */}
          {floodImages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full"></span>
                Flood Scene Images
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {floodImages.map((image, index) => (
                  <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-border">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Flood scene ${index + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span>
              Location Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard icon={<MapPin className="w-5 h-5" />} label="Place Name" value={event.place_name} />
              <InfoCard icon={<MapPin className="w-5 h-5" />} label="Area/Community" value={event.area_name} />
              <InfoCard icon={<MapPin className="w-5 h-5" />} label="City/Town" value={event.city_name} />
              <InfoCard icon={<MapPin className="w-5 h-5" />} label="District" value={event.district_name} />
              <InfoCard icon={<MapPin className="w-5 h-5" />} label="Province" value={event.province} />
              <InfoCard icon={<MapPin className="w-5 h-5" />} label="Country" value={event.country} />
              <InfoCard icon={<MapPin className="w-5 h-5" />} label="Postcode" value={event.postcode} />
              <InfoCard
                icon={<MapPin className="w-5 h-5" />}
                label="Coordinates"
                value={`${event.latitude}, ${event.longitude}`}
              />
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span>
              Event Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard
                icon={<Calendar className="w-5 h-5" />}
                label="Date Started"
                value={event.date_started ? new Date(event.date_started).toLocaleDateString() : "N/A"}
              />
              <InfoCard icon={<Calendar className="w-5 h-5" />} label="Time Started" value={event.time_started} />
              <InfoCard icon={<Calendar className="w-5 h-5" />} label="Duration" value={`${event.duration} hours`} />
              <InfoCard icon={<Droplets className="w-5 h-5" />} label="Depth" value={`${event.depth} meters`} />
              <InfoCard icon={<Droplets className="w-5 h-5" />} label="Extent" value={`${event.extent} km²`} />
              <InfoCard icon={<Building2 className="w-5 h-5" />} label="Structure Type" value={event.structure_type} />
              <InfoCard
                icon={<Droplets className="w-5 h-5" />}
                label="Type/Cause"
                value={event.type_cause?.replace("-", " ")}
              />
              {event.other_cause && (
                <InfoCard icon={<Droplets className="w-5 h-5" />} label="Other Cause" value={event.other_cause} />
              )}
            </div>
            {event.description && (
              <div className="bg-muted/30 p-4 rounded-xl border border-border">
                <p className="text-sm font-medium text-foreground mb-2">Description</p>
                <p className="text-muted-foreground leading-relaxed">{event.description}</p>
              </div>
            )}
          </div>

          {/* Impact Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span>
              Impact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCard
                icon={<Users className="w-5 h-5" />}
                label="People Affected"
                value={event.people_affected}
                highlight
              />
              <InfoCard icon={<Users className="w-5 h-5" />} label="Male Deaths" value={event.male_deaths} highlight />
              <InfoCard
                icon={<Users className="w-5 h-5" />}
                label="Female Deaths"
                value={event.female_deaths}
                highlight
              />
              <InfoCard icon={<Users className="w-5 h-5" />} label="Male Displaced" value={event.male_displaced} />
              <InfoCard icon={<Users className="w-5 h-5" />} label="Female Displaced" value={event.female_displaced} />
              <InfoCard icon={<Users className="w-5 h-5" />} label="Male Injured" value={event.male_injured} />
              <InfoCard icon={<Users className="w-5 h-5" />} label="Female Injured" value={event.female_injured} />
              <InfoCard
                icon={<DollarSign className="w-5 h-5" />}
                label="Economic Loss"
                value={`$${event.economic_loss || 0}`}
                highlight
              />
              <InfoCard
                icon={<Home className="w-5 h-5" />}
                label="Residential Buildings"
                value={event.residential_buildings}
              />
              <InfoCard
                icon={<Building2 className="w-5 h-5" />}
                label="Commercial Buildings"
                value={event.commercial_buildings}
              />
              <InfoCard
                icon={<Building2 className="w-5 h-5" />}
                label="Farmland Area"
                value={`${event.farmland_area} acres`}
              />
              {event.other_infrastructure && (
                <InfoCard
                  icon={<Building2 className="w-5 h-5" />}
                  label="Other Infrastructure"
                  value={event.other_infrastructure}
                />
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full"></span>
              Comments ({comments.length})
            </h3>

            {/* Add Comment Form */}
            {currentUser && (
              <form onSubmit={handleSubmitComment} className="bg-muted/30 p-4 rounded-xl border border-border">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add your comment..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isSubmitting}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-3">
              {isLoadingComments ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-muted-foreground mt-3">Loading comments...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 bg-muted/20 rounded-xl border border-border">
                  <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-card p-4 rounded-xl border border-border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-foreground">{comment.user_name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</p>
                      </div>
                      {currentUser && currentUser.user_id === comment.user_id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete comment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-foreground leading-relaxed">{comment.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Submission Info */}
          <div className="bg-muted/30 p-4 rounded-xl border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Submitted By</p>
                <p className="font-medium text-foreground">{event.submitted_by_email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Submitted On</p>
                <p className="font-medium text-foreground">{new Date(event.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium text-foreground">{new Date(event.updated_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                    event.status === "published"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : event.status === "approved"
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : event.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : "bg-red-100 text-red-800 border-red-200"
                  }`}
                >
                  {event.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-6 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ icon, label, value, highlight = false }) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-200 ${
        highlight
          ? "bg-primary/5 border-primary/30 hover:border-primary/50"
          : "bg-muted/30 border-border hover:border-primary/30"
      }`}
    >
      <div className="flex items-center gap-2 mb-2 text-muted-foreground">
        {icon}
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className={`font-semibold ${highlight ? "text-primary text-lg" : "text-foreground"}`}>{value || "N/A"}</p>
    </div>
  )
}

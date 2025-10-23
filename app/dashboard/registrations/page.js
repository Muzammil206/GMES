"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, UserPlus, Check, X, Mail, AlertCircle, Loader2 } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function ManageUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "user",
    country: "",
    title: "",
    contactPhone: "",
    organization: "",
    designation: "",
  })
  const [generatedPassword, setGeneratedPassword] = useState("")

  const [users, setUsers] = useState([])
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error fetching users:", error)
        toast.error("Failed to fetch users. Please try again.")
        return
      }

      setUsers(data || [])
    } catch (error) {
      console.error("[v0] Fetch users error:", error)
      toast.error("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (userId) => {
    try {
      const { error } = await supabase.from("users").update({ status: "approved" }).eq("id", userId)

      if (error) {
        console.error("[v0] Error approving user:", error)
        toast.error("Failed to approve user. Please try again.")
        return
      }

      setUsers(users.map((user) => (user.id === userId ? { ...user, status: "approved" } : user)))
      toast.success("User approved successfully.")
    } catch (error) {
      console.error("[v0] Approve user error:", error)
      toast.error("An unexpected error occurred.")
    }
  }

  const handleReject = async (userId) => {
    try {
      const { error } = await supabase.from("users").update({ status: "rejected" }).eq("id", userId)

      if (error) {
        console.error("[v0] Error rejecting user:", error)
        toast.error("Failed to reject user. Please try again.")
        return
      }

      setUsers(users.map((user) => (user.id === userId ? { ...user, status: "rejected" } : user)))
      toast.success("User rejected successfully.")
    } catch (error) {
      console.error("[v0] Reject user error:", error)
      toast.error("An unexpected error occurred.")
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await supabase.from("users").update({ role: newRole }).eq("id", userId)

      if (error) {
        console.error("[v0] Error updating role:", error)
        toast.error("Failed to update role. Please try again.")
        return
      }

      setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
      toast.success("User role updated successfully.")
    } catch (error) {
      console.error("[v0] Role change error:", error)
      toast.error("An unexpected error occurred.")
    }
  }

  const handleAddUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.country) {
      toast.error("Please fill in all required fields.")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user")
      }

      setUsers([data.user, ...users])
      setGeneratedPassword(data.credentials.password)

      toast.success("User created successfully!", {
        description: `Password: ${data.credentials.password}`,
      })

      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        role: "user",
        country: "",
        title: "",
        contactPhone: "",
        organization: "",
        designation: "",
      })

      setTimeout(() => {
        setIsAddUserOpen(false)
        setGeneratedPassword("")
      }, 5000)
    } catch (error) {
      console.error("[v0] Create user error:", error)
      toast.error(error.message || "Failed to create user. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.country?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = filterRole === "all" || user.role === filterRole
    const matchesStatus = filterStatus === "all" || user.status === filterStatus

    return matchesSearch && matchesRole && matchesStatus
  })

  const pendingUsers = filteredUsers.filter((user) => user.status === "pending")
  const approvedUsers = filteredUsers.filter((user) => user.status === "approved")
  const rejectedUsers = filteredUsers.filter((user) => user.status === "rejected")

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "country_admin":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "user":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "rejected":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin":
        return "General Admin"
      case "country_admin":
        return "Country Admin"
      case "user":
        return "User"
      default:
        return role
    }
  }

  const UserRow = ({ user }) => (
    <TableRow>
      <TableCell>
        <div>
          <p className="font-medium text-foreground">
            {user.firstname} {user.lastname}
          </p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </TableCell>
      <TableCell>{user.country}</TableCell>
      <TableCell>
        <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="country_admin">Country Admin</SelectItem>
            <SelectItem value="admin">General Admin</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={getStatusBadgeColor(user.status)}>
          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</TableCell>
      <TableCell>
        <div className="flex gap-2">
          {user.status === "pending" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 hover:text-green-700 hover:bg-green-50 bg-transparent"
                onClick={() => handleApprove(user.id)}
              >
                <Check className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                onClick={() => handleReject(user.id)}
              >
                <X className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          {user.status === "rejected" && (
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 hover:text-green-700 hover:bg-green-50 bg-transparent"
              onClick={() => handleApprove(user.id)}
            >
              <Check className="w-4 h-4 mr-1" />
              Approve
            </Button>
          )}
          {user.status === "approved" && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
              onClick={() => handleReject(user.id)}
            >
              <X className="w-4 h-4 mr-1" />
              Revoke
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Approve registrations and manage user roles</p>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#4B6EA0FF] hover:bg-primary/90">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User Manually
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Manually register a user. Login credentials will be generated automatically.
              </DialogDescription>
            </DialogHeader>
            {generatedPassword && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-green-800">User Created Successfully!</p>
                <p className="text-sm text-green-700">
                  Email: <span className="font-mono">{newUser.email}</span>
                </p>
                <p className="text-sm text-green-700">
                  Password: <span className="font-mono font-bold">{generatedPassword}</span>
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Please save these credentials and share them with the user.
                </p>
              </div>
            )}
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    placeholder="John"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    placeholder="Doe"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Select
                  value={newUser.title}
                  onValueChange={(value) => setNewUser({ ...newUser, title: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                    <SelectItem value="Prof">Prof</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="john.doe@example.com"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  value={newUser.contactPhone}
                  onChange={(e) => setNewUser({ ...newUser, contactPhone: e.target.value })}
                  placeholder="+234 xxx xxx xxxx"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={newUser.organization}
                  onChange={(e) => setNewUser({ ...newUser, organization: e.target.value })}
                  placeholder="Organization name"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={newUser.designation}
                  onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
                  placeholder="Job title"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select
                  value={newUser.country}
                  onValueChange={(value) => setNewUser({ ...newUser, country: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nigeria">Nigeria</SelectItem>
                    <SelectItem value="Ghana">Ghana</SelectItem>
                    <SelectItem value="Senegal">Senegal</SelectItem>
                    <SelectItem value="Benin">Benin</SelectItem>
                    <SelectItem value="Togo">Togo</SelectItem>
                    <SelectItem value="Côte d'Ivoire">Côte d'Ivoire</SelectItem>
                    <SelectItem value="Mali">Mali</SelectItem>
                    <SelectItem value="Burkina Faso">Burkina Faso</SelectItem>
                    <SelectItem value="Niger">Niger</SelectItem>
                    <SelectItem value="Guinea">Guinea</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="country_admin">Country Admin</SelectItem>
                    <SelectItem value="admin">General Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddUser} className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating User...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Create User & Generate Credentials
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedUsers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, email, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="country_admin">Country Admin</SelectItem>
                <SelectItem value="admin">General Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table with Tabs */}
      <Card>
        <Tabs defaultValue="pending" className="w-full">
          <CardHeader>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="pending" className="relative">
                Pending
                {pendingUsers.length > 0 && (
                  <Badge className="ml-2 bg-yellow-500 text-white">{pendingUsers.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All Users</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="pending" className="mt-0">
              {pendingUsers.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending registrations</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.map((user) => (
                        <UserRow key={user.id} user={user} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            <TabsContent value="approved" className="mt-0">
              {approvedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No approved users</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvedUsers.map((user) => (
                        <UserRow key={user.id} user={user} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            <TabsContent value="rejected" className="mt-0">
              {rejectedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No rejected users</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rejectedUsers.map((user) => (
                        <UserRow key={user.id} user={user} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            <TabsContent value="all" className="mt-0">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <UserRow key={user.id} user={user} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
}

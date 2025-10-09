import { useEffect, useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { useAuth } from "../contexts/AuthContext";
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase";

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      if (!user?.id) return;
      const snap = await getDoc(doc(firestore, "users", user.id));
      if (snap.exists()) {
        const data = snap.data();
        setUsername(data.username || "");
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
        setEmail(data.email || "");
      }
    }
    fetchUser();
  }, [user?.id]);

  // Update Firestore profile
  async function saveProfile() {
    setMsg(null);
    if (!user?.id) return;
    await updateDoc(doc(firestore, "users", user.id), {
      username,
      firstName,
      lastName,
      email,
    });
    setMsg("Profile updated!");
  }

  // Update password
  async function changePwd() {
    setPwdMsg(null);
    if (newPwd.length < 6) {
      setPwdMsg("Password must be at least 6 characters");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg("Passwords do not match");
      return;
    }
    try {
      const auth = getAuth();
      if (!auth.currentUser || !email) throw new Error();
      const credential = EmailAuthProvider.credential(email, currentPwd);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPwd);
      setPwdMsg("Password updated");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch {
      setPwdMsg("Unable to update password. Check your old password.");
    }
  }

  return (
    <div className="container py-8 md:py-10">
      <h1 className="text-2xl font-bold">Profile Settings</h1>
      {msg && <div className="mb-2 text-green-600">{msg}</div>}
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr,380px]">
        <section className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold">Profile</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={saveProfile}>Save changes</Button>
            </div>
          </div>

          <Separator />

          <div>
            {pwdMsg && <div className="mb-2 text-red-600">{pwdMsg}</div>}
            <h3 className="text-sm font-semibold">Change password</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="space-y-1 sm:col-span-1">
                <Label htmlFor="currentPwd">Current password</Label>
                <Input
                  id="currentPwd"
                  type="password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                />
              </div>
              <div className="space-y-1 sm:col-span-1">
                <Label htmlFor="newPwd">New password</Label>
                <Input
                  id="newPwd"
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                />
              </div>
              <div className="space-y-1 sm:col-span-1">
                <Label htmlFor="confirmPwd">Confirm new password</Label>
                <Input
                  id="confirmPwd"
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Button onClick={changePwd}>Update password</Button>
              {pwdMsg && (
                <span className="text-sm text-muted-foreground">{pwdMsg}</span>
              )}
            </div>
          </div>

          <Separator />
        </section>

        <aside className="h-fit rounded-xl border p-4 text-sm text-muted-foreground">
          <div>
            Manage your profile information and password. Your changes are saved
            in your browser for this demo.
          </div>
        </aside>
      </div>
    </div>
  );
}

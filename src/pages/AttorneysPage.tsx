import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { subscribeFirestoreMembers, DEFAULT_ATTORNEY_LIST, getOfficeBadge, type FirestoreMember } from "@/lib/users";
import { loadProfile, saveProfile, handleProfileImageError, type AttorneyProfile } from "@/lib/profile-store";
import { uploadToImgBB, IMGBB_ALBUM_URL } from "@/lib/imgbb";
import { makeAvatarSvg } from "@/lib/avatar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { InviteModal } from "@/components/InviteModal";
import { Pencil, X, Check, Phone, Mail, BookOpen, Star, ChevronDown, Loader2, ExternalLink, Users } from "lucide-react";

function EditableText({
  value,
  onSave,
  placeholder,
  multiline = false,
  className = ""
}: {
  value: string;
  onSave: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  const commit = () => { onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  if (editing) {
    return (
      <div className="relative w-full">
        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={4}
            className={`w-full border-2 border-yellow-500 bg-white text-gray-900 px-3 py-2 focus:outline-none text-sm resize-y ${className}`}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className={`w-full border-2 border-yellow-500 bg-white text-gray-900 px-3 py-2 focus:outline-none text-sm ${className}`}
          />
        )}
        <div className="flex gap-2 mt-1">
          <button onClick={commit} className="flex items-center gap-1 text-xs bg-yellow-500 text-black px-3 py-1 font-bold hover:bg-yellow-600 transition-colors">
            <Check className="w-3 h-3" /> Save
          </button>
          <button onClick={cancel} className="flex items-center gap-1 text-xs border border-gray-300 text-gray-600 px-3 py-1 hover:bg-gray-100 transition-colors">
            <X className="w-3 h-3" /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className={`cursor-text group/edit relative ${className}`}
      title="Click to edit"
    >
      {value || <span className="text-gray-400 italic">{placeholder}</span>}
      <Pencil className="inline w-3 h-3 ml-1 text-yellow-500 opacity-0 group-hover/edit:opacity-100 transition-opacity" />
    </span>
  );
}

function ProfileModal({
  member,
  canEdit,
  onClose
}: {
  member: FirestoreMember;
  canEdit: boolean;
  onClose: () => void;
}) {
  const [profile, setProfile] = useState<AttorneyProfile>(() => loadProfile(member.name, member));
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProfile(loadProfile(member.name, member));

    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<AttorneyProfile>;
      if (customEvent.detail && customEvent.detail.name === member.name) {
        setProfile(customEvent.detail);
      }
    };

    window.addEventListener("lexvanguard_profile_updated", handleProfileUpdate);
    return () => window.removeEventListener("lexvanguard_profile_updated", handleProfileUpdate);
  }, [member]);

  const [uploadingImage, setUploadingImage] = useState(false);

  const update = (field: keyof AttorneyProfile, value: string) => {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    saveProfile(updated);
  };

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size should be under 10MB");
      return;
    }

    try {
      setUploadingImage(true);
      const imageUrl = await uploadToImgBB(file, profile.name);
      update("image", imageUrl);
    } catch (err: any) {
      console.error("ImgBB upload error:", err);
      alert("Image upload failed: " + (err?.message || "Please try again."));
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-t-4 border-yellow-500"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-black text-white p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-extrabold uppercase tracking-wider text-yellow-500">{profile.name}</h2>
            <p className="text-gray-300 text-sm mt-1">
              {canEdit ? (
                <EditableText value={profile.title} onSave={v => update('title', v)} placeholder="Add title" />
              ) : profile.title}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors ml-4 mt-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {canEdit && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 text-xs text-yellow-800 font-semibold">
              <Pencil className="inline w-3 h-3 mr-1" /> Click any text below to edit, or hover over your photo to upload a new profile picture. Changes save automatically.
            </div>
          )}

          <div className="flex gap-6 items-start">
            <div className="relative group shrink-0">
              <img
                src={profile.image}
                alt={profile.name}
                onError={(e) => handleProfileImageError(e, profile.name)}
                className="w-32 h-40 object-cover border-2 border-gray-200 shrink-0"
              />
              {canEdit && (
                <>
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/70 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center text-xs font-bold"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="w-5 h-5 mb-1 text-yellow-500 animate-spin" />
                        <span>Uploading to ImgBB...</span>
                      </>
                    ) : (
                      <>
                        <Pencil className="w-5 h-5 mb-1 text-yellow-500" />
                        <span>Upload Photo</span>
                      </>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageFile}
                  />
                </>
              )}
            </div>
            <div className="flex-1">
              {canEdit && (
                <div className="mb-3">
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider transition-colors mb-2 cursor-pointer"
                  >
                    {uploadingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Pencil className="w-3 h-3" />}
                    {uploadingImage ? "Uploading to ImgBB..." : "Upload Photo (ImgBB Album)"}
                  </button>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-gray-500 font-bold uppercase">Image URL:</span>
                      <a
                        href={IMGBB_ALBUM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-600 hover:text-black font-extrabold flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> View Album (xKqQD6)
                      </a>
                    </div>
                    <input
                      type="text"
                      placeholder="https://i.ibb.co/..."
                      value={profile.image}
                      onChange={e => update("image", e.target.value)}
                      className="border border-gray-300 text-xs px-2 py-1 w-full text-gray-800 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}
              <p className="text-yellow-600 font-bold text-xs uppercase tracking-widest mb-1">Practice Areas</p>
              <p className="text-sm text-gray-700 font-semibold mb-4">
                {canEdit ? (
                  <EditableText value={profile.practice} onSave={v => update('practice', v)} placeholder="Add practice areas" className="block" />
                ) : profile.practice}
              </p>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-yellow-500 shrink-0" />
                  {canEdit ? (
                    <EditableText value={profile.phone} onSave={v => update('phone', v)} placeholder="Add phone number" />
                  ) : profile.phone}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-yellow-500 shrink-0" />
                  {canEdit ? (
                    <EditableText value={profile.email} onSave={v => update('email', v)} placeholder="Add email" />
                  ) : profile.email}
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-yellow-600 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-1">
              <BookOpen className="w-4 h-4" /> Education
            </p>
            <p className="text-sm text-gray-700">
              {canEdit ? (
                <EditableText value={profile.education} onSave={v => update('education', v)} placeholder="Add education history" multiline className="block" />
              ) : profile.education}
            </p>
          </div>

          <div>
            <p className="text-yellow-600 font-bold text-xs uppercase tracking-widest mb-2">Biography</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {canEdit ? (
                <EditableText value={profile.bio} onSave={v => update('bio', v)} placeholder="Write your professional biography..." multiline className="block" />
              ) : profile.bio}
            </p>
          </div>

          <div>
            <p className="text-yellow-600 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-1">
              <Star className="w-4 h-4" /> Achievements
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {canEdit ? (
                <EditableText value={profile.achievements} onSave={v => update('achievements', v)} placeholder="Add notable achievements, awards, or recognitions..." multiline className="block" />
              ) : profile.achievements}
            </p>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button onClick={onClose} className="w-full bg-black text-white py-3 font-bold uppercase tracking-widest text-xs hover:bg-gray-900 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function AttorneyCard({
  member,
  canEdit,
  onViewProfile
}: {
  member: FirestoreMember;
  canEdit: boolean;
  onViewProfile: () => void;
}) {
  const [profile, setProfile] = useState<AttorneyProfile>(() => loadProfile(member.name, member));

  useEffect(() => {
    setProfile(loadProfile(member.name, member));

    const handleProfileUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<AttorneyProfile>;
      if (customEvent.detail && customEvent.detail.name === member.name) {
        setProfile(customEvent.detail);
      }
    };

    window.addEventListener("lexvanguard_profile_updated", handleProfileUpdate);
    return () => window.removeEventListener("lexvanguard_profile_updated", handleProfileUpdate);
  }, [member]);

  const update = (field: keyof AttorneyProfile, value: string) => {
    const updated = { ...profile, [field]: value };
    setProfile(updated);
    saveProfile(updated);
  };

  const badgeText = getOfficeBadge(member);

  return (
    <div 
      tabIndex={0}
      className="group cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500/50 p-1 rounded transition-all"
    >
      <div
        className="relative overflow-hidden mb-4 border-2 border-gray-100 group-hover:border-yellow-500 group-focus:border-yellow-500 transition-colors duration-300"
        onClick={onViewProfile}
      >
        <img
          src={profile.image}
          alt={profile.name}
          onError={(e) => handleProfileImageError(e, member.name)}
          className="w-full h-[380px] object-cover grayscale-0 brightness-100 md:grayscale md:brightness-95 md:group-hover:grayscale-0 md:group-hover:brightness-100 group-focus:grayscale-0 group-focus:brightness-105 group-active:grayscale-0 group-active:brightness-105 transition-all duration-500 transform group-hover:scale-105 group-focus:scale-105"
        />
        <div className="absolute inset-0 bg-transparent md:bg-black/10 md:group-hover:bg-transparent group-focus:bg-transparent transition-colors duration-300" />
        
        {/* Office Rank Hierarchy Badge */}
        <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur-sm text-yellow-500 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 border-l-2 border-yellow-500 shadow-md">
          {badgeText}
        </div>

        {canEdit && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-black text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 flex items-center gap-1 shadow-md">
            <Pencil className="w-3 h-3" /> Your Profile
          </div>
        )}
      </div>

      <h3 className="text-xl font-extrabold text-black group-hover:text-yellow-500 group-focus:text-yellow-500 transition-colors uppercase tracking-wide">
        {profile.name}
      </h3>

      {canEdit ? (
        <div className="mt-1 mb-2">
          <EditableText
            value={profile.title}
            onSave={v => update('title', v)}
            placeholder="Add your title"
            className="text-yellow-500 font-bold text-sm uppercase tracking-wider"
          />
        </div>
      ) : (
        <p className="text-yellow-500 font-bold text-sm uppercase tracking-wider mt-1 mb-2">{profile.title}</p>
      )}

      {canEdit ? (
        <div className="mb-3">
          <EditableText
            value={profile.practice}
            onSave={v => update('practice', v)}
            placeholder="Add practice areas"
            className="text-gray-500 text-sm"
          />
        </div>
      ) : (
        <p className="text-gray-500 text-sm mb-3">
          <span className="font-semibold text-gray-700">Practice:</span> {profile.practice}
        </p>
      )}

      <button
        onClick={onViewProfile}
        className="mt-2 text-xs font-bold uppercase tracking-widest text-black border-b-2 border-black pb-1 group-hover:text-yellow-500 group-hover:border-yellow-500 group-focus:text-yellow-500 group-focus:border-yellow-500 transition-all bg-transparent cursor-pointer">
        View Profile »
      </button>
    </div>
  );
}

export default function AttorneysPage() {
  const { firmUser } = useAuth();
  const [members, setMembers] = useState<FirestoreMember[]>(DEFAULT_ATTORNEY_LIST);
  const [activeProfile, setActiveProfile] = useState<FirestoreMember | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const isFounder = firmUser && (firmUser.role.level >= 100 || ['prince', 'kelvin', 'donel'].includes(firmUser.officeId));

  useEffect(() => {
    const unsubscribe = subscribeFirestoreMembers((updated) => {
      setMembers(updated);
    });
    return () => unsubscribe();
  }, []);

  const visibleMembers = showAll ? members : members.slice(0, 6);

  return (
    <div className="w-full bg-white">
      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
      {activeProfile && (
        <ProfileModal
          member={activeProfile}
          canEdit={
            !!firmUser &&
            (firmUser.id === activeProfile.uid || firmUser.name.toLowerCase() === activeProfile.name.toLowerCase())
          }
          onClose={() => setActiveProfile(null)}
        />
      )}

      <Header />

      <div className="bg-black pt-40 pb-20 px-6 text-center border-b-4 border-yellow-500">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white uppercase tracking-wider">Our Attorneys</h1>
        <div className="h-1 w-16 bg-yellow-500 mx-auto mt-6" />
        <p className="text-gray-400 max-w-xl mx-auto mt-6 text-sm leading-relaxed">
          A community of equals united by a common goal — every member is acknowledged and respected as intrinsically valuable to the whole.
        </p>

        {isFounder && (
          <div className="mt-8">
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-lg cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Invite New Team Member (Founders Only)</span>
            </button>
          </div>
        )}
      </div>

      {firmUser && (
        <div className="bg-yellow-500 text-black px-6 py-3 text-center text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
          <Pencil className="w-3 h-3" />
          Logged in as {firmUser.name} — click your profile card to edit your public information
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-14 text-center text-black">
        <p className="text-gray-600 leading-loose text-lg">
          At LexVanguard, our greatest asset is our exceptional team of legal minds. From seasoned litigators who have shaped landmark appellate decisions to innovative strategists guiding the next generation of tech enterprises, our attorneys merge a modern mindset with the traditional practices we value.
        </p>
      </div>

      <div className="max-w-[1300px] mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {visibleMembers.map((m, idx) => (
            <AttorneyCard
              key={`${m.uid || 'member'}-${m.name}-${idx}`}
              member={m}
              canEdit={
                !!firmUser &&
                (firmUser.id === m.uid || firmUser.name.toLowerCase() === m.name.toLowerCase())
              }
              onViewProfile={() => setActiveProfile(m)}
            />
          ))}
        </div>
        {members.length > 6 && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAll(!showAll)}
              className="border-2 border-black text-black hover:bg-black hover:text-white transition-colors px-8 py-3 font-bold uppercase tracking-widest text-sm flex items-center gap-2 mx-auto">
              {showAll ? 'Show Less' : `Show All ${members.length} Members`}
              <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

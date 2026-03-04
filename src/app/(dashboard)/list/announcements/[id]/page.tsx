import { notFound } from "next/navigation";

async function getAnnouncement(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/announcements/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function AnnouncementDetails({ params }: { params: { id: string } }) {
  const announcement = await getAnnouncement(params.id);
  if (!announcement) return notFound();

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-8">
      <button onClick={() => history.back()} className="mb-4 text-blue-600 dark:text-blue-400 hover:underline">&larr; Back</button>
      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{announcement.title}</h1>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {new Date(announcement.date).toLocaleDateString()} {announcement.classId && <span> | Class: {announcement.classId}</span>}
      </div>
      <div className="prose dark:prose-invert">
        {announcement.description}
      </div>
    </div>
  );
} 
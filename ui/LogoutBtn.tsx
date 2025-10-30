export default function LogoutBtn() {
  return (
    <form
      action="/api/google/logout"
      method="POST"
      className="p-4 border-t border-gray-800"
    >
      <button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-md transition-colors"
      >
        Logout
      </button>
    </form>
  );
}

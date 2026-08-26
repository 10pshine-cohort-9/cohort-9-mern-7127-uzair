const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <img
        src="Empty-state.png"
        alt=""
        className="w-64 h-auto mb-4"
      />

      <h2
        className="text-xl mt-2"
        style={{ color: '#1D2939', fontFamily: "Georgia, 'Source Serif Pro', serif" }}
      >
        Write down your ideas
      </h2>
      <p className="text-sm text-gray-500 mt-2 max-w-xs">
        Select a note from the list, or create a new one to get started.
      </p>
    </div>
  )
}

export default EmptyState
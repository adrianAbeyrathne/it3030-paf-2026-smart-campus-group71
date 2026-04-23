function EmptyState({ title, description }) {
  return (
    <div className="rounded-xl bg-white p-12 text-center shadow-sm">
      <h3 className="text-[20px] font-semibold text-[#1F2937]">{title}</h3>
      <p className="mt-2 text-[14px] text-[#6B7280]">{description}</p>
    </div>
  );
}

export default EmptyState;

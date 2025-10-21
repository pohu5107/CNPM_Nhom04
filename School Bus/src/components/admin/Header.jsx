export default function Header({ title, name = "Admin" }) {
    return (
        <div className="flex items-center justify-between border-b border-[#D8E359] py-5 px-6 bg-white rounded-t-2xl shadow-md mb-6">
            <div className="text-3xl font-semibold text-[#174D2C] tracking-wide">{title}</div>
            <div className="text-lg font-medium text-[#174D2C]">
                Xin chào, <span className="font-semibold text-[#FC791A]">{name}</span> !
            </div>
        </div>
    );
}
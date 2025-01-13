import SampleInquiry from "./SampleInquiry"

export default function SampleInquiries() {
  const sampleInquiries: string[] = [
    "When is the application for school year 2025-2026?",
    "Give me some recommended learning materials on Operating Systems.",
    "Who should I contact for more information?",
  ]

  return (
    <div className="relative w-full">
      <div className="overflow-x-auto py-4 scrollbar-hide">
        <p className="ms-3 py-3 text-xl font-bold">Sample Inquiry</p>
        <div className="flex w-max space-x-4 px-4">
          {sampleInquiries.map((inquiry, index) => (
            <SampleInquiry key={index} text={inquiry} />
          ))}
        </div>
      </div>
    </div>
  );
};

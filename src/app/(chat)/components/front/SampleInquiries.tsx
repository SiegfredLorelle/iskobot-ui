import SampleInquiry from "./SampleInquiry";

export default function SampleInquiries() {
  const sampleInquiries: string[] = [
    "Ano ang pinakalatest na balita sa PUP ngayon?",
    "Explain the difference between 2 state machines.",
    "Pillars of OOP?",
    // "Are there any PhD or master's programs at PUP-OUS?",
    // "PUP Open University System 是什么?",
  ];

  return (
    <div className="relative w-full">
      <div className="overflow-x-auto py-4 scrollbar-hide">
        <p className="ms-3 py-3 text-xl text-[var(--primary-clr)]  font-bold">Sample Inquiry</p>
        <div className="flex w-max space-x-4 px-4">
          {sampleInquiries.map((inquiry, index) => (
            <SampleInquiry key={index} text={inquiry} />
          ))}
        </div>
      </div>
    </div>
  );
}

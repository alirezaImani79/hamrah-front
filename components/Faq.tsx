import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS: { q: string; a: string }[] = [
  {
    q: "استفاده از همراه چقدر هزینه داره؟",
    a: "هیچی! توی فاز اول، همراه کاملاً رایگان و داوطلبانه‌ست و هیچ پولی بین کاربرها رد و بدل نمی‌شه.",
  },
  {
    q: "هم‌سفر مناسب چطوری پیدا می‌شه؟",
    a: "هوش مصنوعی مسیر، ساعت حرکت و ترجیح‌هات رو کنار هم می‌ذاره و سازگارترین گزینه‌ها رو پیشنهاد می‌ده.",
  },
  {
    q: "می‌تونم ترجیح جنسیتی مشخص کنم؟",
    a: "آره؛ موقع ثبت سفر، ترجیح‌هات از جمله جنسیت هم‌سفر رو تعیین می‌کنی تا پیشنهادها همون‌طوری باشن که می‌خوای.",
  },
  {
    q: "ماشین ندارم؛ بازم می‌تونم استفاده کنم؟",
    a: "معلومه! به‌عنوان مسافر، سفرهای ثبت‌شده رو جست‌وجو کن و برای هر کدوم که خواستی درخواست همراهی بفرست.",
  },
  {
    q: "دستیار هوشمند دقیقاً چیکار می‌کنه؟",
    a: "مثل یه راهنمای همیشه‌آنلاین عمل می‌کنه؛ توی ثبت سفر کمکت می‌کنه، هم‌سفر پیشنهاد می‌ده و جواب سؤال‌هات رو همون لحظه می‌ده.",
  },
];

export default function Faq() {
  return (
    <Section id="faq">
      <SectionHeading eyebrow="سؤالای پرتکرار" title="هرچی باید بدونی" />
      <div className="mx-auto mt-12 max-w-2xl">
        <Accordion multiple={false}>
          {FAQS.map((item, i) => (
            <AccordionItem key={item.q} value={`faq-${i}`}>
              <AccordionTrigger className="py-5 text-base font-semibold text-foreground">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-8 text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}

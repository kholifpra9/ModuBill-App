import type { Metadata } from "next";
import { NewTemplateForm } from "./new-template-form";

export const metadata: Metadata = {
  title: "Buat Template",
};

export default function NewTemplatePage() {
  return <NewTemplateForm />;
}
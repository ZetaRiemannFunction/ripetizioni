import React from "react";
import { Phone, GraduationCap } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function TutorCard({ tutor }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="aspect-[4/5] w-full overflow-hidden bg-muted">
        {tutor.foto_url ? (
          <Image
            src={tutor.foto_url}
            alt={tutor.nome}
            className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
            fittingType="fill"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <GraduationCap className="h-12 w-12" />
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-heading text-2xl text-foreground">{tutor.nome}</h3>
        {tutor.laurea && (
          <p className="mt-1 flex items-start gap-1.5 text-sm text-foreground/70">
            <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {tutor.laurea}
          </p>
        )}
        {tutor.bio && <p className="mt-3 text-sm leading-relaxed text-foreground/70">{tutor.bio}</p>}
        {tutor.telefono && (
          <a
            href={`tel:${tutor.telefono}`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Phone className="h-4 w-4" /> {tutor.telefono}
          </a>
        )}
      </div>
    </div>
  );
}
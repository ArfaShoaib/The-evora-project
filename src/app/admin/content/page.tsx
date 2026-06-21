'use client';

import * as React from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { getSiteContent, updateSiteSection } from '@/lib/admin-actions';
import { ImageInput } from '@/components/admin/ImageInput';

type SectionData = { id: string; section_key: string; content: Record<string, unknown> };

const sectionLabels: Record<string, string> = {
  flash_sale: 'Flash Sale',
  hero: 'Hero Banner',
  sale_banner: 'Sale Banner',
  featured_collections: 'Featured Collections',
  seasonal: 'Seasonal Collection',
  about: 'About Section',
  testimonials: 'Testimonials',
  instagram_gallery: 'Instagram Gallery',
  page_contact: 'Contact Us',
  page_faq: 'FAQ',
  page_shipping: 'Shipping Policy',
  page_returns: 'Returns & Exchanges',
};

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent"
      />
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 3, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent resize-none"
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-[#C9A84C]' : 'bg-gray-300'}`}
      >
        <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  );
}

function HeroEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <Input label="Tagline" value={(data.tagline as string) || ''} onChange={(v) => onChange({ ...data, tagline: v })} />
      <Input label="Title" value={(data.title as string) || ''} onChange={(v) => onChange({ ...data, title: v })} />
      <Textarea label="Description" value={(data.description as string) || ''} onChange={(v) => onChange({ ...data, description: v })} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Primary CTA Text" value={(data.cta_primary_text as string) || ''} onChange={(v) => onChange({ ...data, cta_primary_text: v })} />
        <Input label="Primary CTA Link" value={(data.cta_primary_link as string) || ''} onChange={(v) => onChange({ ...data, cta_primary_link: v })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Secondary CTA Text" value={(data.cta_secondary_text as string) || ''} onChange={(v) => onChange({ ...data, cta_secondary_text: v })} />
        <Input label="Secondary CTA Link" value={(data.cta_secondary_link as string) || ''} onChange={(v) => onChange({ ...data, cta_secondary_link: v })} />
      </div>
    </div>
  );
}

function AnnouncementBarEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return null;
}

function FlashSaleEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <Toggle label="Active" checked={(data.active as boolean) ?? false} onChange={(v) => onChange({ ...data, active: v })} />
      <Input label="Title" value={(data.title as string) || ''} onChange={(v) => onChange({ ...data, title: v })} placeholder="FLASH SALE" />
      <Input label="Subtitle" value={(data.subtitle as string) || ''} onChange={(v) => onChange({ ...data, subtitle: v })} placeholder="Up to 50% Off" />
      <Textarea label="Description" value={(data.description as string) || ''} onChange={(v) => onChange({ ...data, description: v })} placeholder="Limited time offer — don't miss out!" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="CTA Text" value={(data.cta_text as string) || ''} onChange={(v) => onChange({ ...data, cta_text: v })} placeholder="Shop Now" />
        <Input label="CTA Link" value={(data.cta_link as string) || ''} onChange={(v) => onChange({ ...data, cta_link: v })} placeholder="/sale" />
      </div>
      <Input label="End Date" value={(data.end_date as string) || ''} onChange={(v) => onChange({ ...data, end_date: v })} placeholder="2026-07-01T00:00:00" />
      <p className="text-xs text-gray-400">Countdown timer will show automatically based on end date.</p>
    </div>
  );
}

function SaleBannerEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <Toggle label="Active" checked={(data.active as boolean) ?? true} onChange={(v) => onChange({ ...data, active: v })} />
      <Input label="Subtitle" value={(data.subtitle as string) || ''} onChange={(v) => onChange({ ...data, subtitle: v })} />
      <Input label="Title" value={(data.title as string) || ''} onChange={(v) => onChange({ ...data, title: v })} />
      <Textarea label="Description" value={(data.description as string) || ''} onChange={(v) => onChange({ ...data, description: v })} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="CTA Text" value={(data.cta_text as string) || ''} onChange={(v) => onChange({ ...data, cta_text: v })} />
        <Input label="CTA Link" value={(data.cta_link as string) || ''} onChange={(v) => onChange({ ...data, cta_link: v })} />
      </div>
    </div>
  );
}

function SeasonalEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <Input label="Subtitle" value={(data.subtitle as string) || ''} onChange={(v) => onChange({ ...data, subtitle: v })} />
      <Input label="Title" value={(data.title as string) || ''} onChange={(v) => onChange({ ...data, title: v })} />
      <Textarea label="Description" value={(data.description as string) || ''} onChange={(v) => onChange({ ...data, description: v })} />
      <ImageInput label="Image URL" value={(data.image_url as string) || ''} onChange={(v) => onChange({ ...data, image_url: v })} bucket="banners" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Primary CTA Text" value={(data.cta_primary_text as string) || ''} onChange={(v) => onChange({ ...data, cta_primary_text: v })} />
        <Input label="Primary CTA Link" value={(data.cta_primary_link as string) || ''} onChange={(v) => onChange({ ...data, cta_primary_link: v })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Secondary CTA Text" value={(data.cta_secondary_text as string) || ''} onChange={(v) => onChange({ ...data, cta_secondary_text: v })} />
        <Input label="Secondary CTA Link" value={(data.cta_secondary_link as string) || ''} onChange={(v) => onChange({ ...data, cta_secondary_link: v })} />
      </div>
    </div>
  );
}

function AboutEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const values = (data.values as Array<{ title: string; description: string }>) || [];
  const team = (data.team as Array<{ name: string; role: string; avatar_url: string }>) || [];

  const updateValue = (index: number, field: string, value: string) => {
    const updated = [...values];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, values: updated });
  };
  const addValue = () => onChange({ ...data, values: [...values, { title: '', description: '' }] });
  const removeValue = (index: number) => onChange({ ...data, values: values.filter((_: unknown, i: number) => i !== index) });

  const updateTeam = (index: number, field: string, value: string) => {
    const updated = [...team];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, team: updated });
  };
  const addTeam = () => onChange({ ...data, team: [...team, { name: '', role: '', avatar_url: '' }] });
  const removeTeam = (index: number) => onChange({ ...data, team: team.filter((_: unknown, i: number) => i !== index) });

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Hero</h4>
        <Input label="Title" value={(data.title as string) || ''} onChange={(v) => onChange({ ...data, title: v })} />
        <Textarea label="Description" value={(data.description as string) || ''} onChange={(v) => onChange({ ...data, description: v })} rows={3} />
      </div>

      {/* Mission */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Mission</h4>
        <Input label="Mission Title" value={(data.mission_title as string) || ''} onChange={(v) => onChange({ ...data, mission_title: v })} />
        <Textarea label="Mission Description" value={(data.mission as string) || ''} onChange={(v) => onChange({ ...data, mission: v })} rows={4} />
        <ImageInput label="Mission Image URL" value={(data.mission_image as string) || ''} onChange={(v) => onChange({ ...data, mission_image: v })} bucket="banners" />
      </div>

      {/* Values */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Values</h4>
        {values.map((item, i) => (
          <div key={i} className="p-4 border border-gray-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Value {i + 1}</span>
              <button onClick={() => removeValue(i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>
            <Input label="Title" value={item.title} onChange={(v) => updateValue(i, 'title', v)} />
            <Textarea label="Description" value={item.description} onChange={(v) => updateValue(i, 'description', v)} rows={2} />
          </div>
        ))}
        <button onClick={addValue} className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors">
          + Add Value
        </button>
      </div>

      {/* Team */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Team</h4>
        <Input label="Team Section Title" value={(data.team_title as string) || ''} onChange={(v) => onChange({ ...data, team_title: v })} />
        <Textarea label="Team Section Description" value={(data.team_description as string) || ''} onChange={(v) => onChange({ ...data, team_description: v })} rows={2} />
        {team.map((member, i) => (
          <div key={i} className="p-4 border border-gray-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Member {i + 1}</span>
              <button onClick={() => removeTeam(i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Name" value={member.name} onChange={(v) => updateTeam(i, 'name', v)} />
              <Input label="Role" value={member.role} onChange={(v) => updateTeam(i, 'role', v)} />
            </div>
            <ImageInput label="Avatar URL" value={member.avatar_url} onChange={(v) => updateTeam(i, 'avatar_url', v)} bucket="banners" />
          </div>
        ))}
        <button onClick={addTeam} className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors">
          + Add Team Member
        </button>
      </div>
    </div>
  );
}

function FeaturedCollectionsEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const items = (data.items as Array<{ name: string; slug: string; description: string; image_url: string }>) || [];

  const updateItem = (index: number, field: string, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, items: updated });
  };

  const addItem = () => {
    onChange({ ...data, items: [...items, { name: '', slug: '', description: '', image_url: '' }] });
  };

  const removeItem = (index: number) => {
    onChange({ ...data, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">Add categories to display in the Featured Collections section on the homepage.</p>
      {items.map((item, i) => (
        <div key={i} className="p-4 border border-gray-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Collection {i + 1}</span>
            <button onClick={() => removeItem(i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Name" value={item.name} onChange={(v) => updateItem(i, 'name', v)} placeholder="e.g. Dresses" />
            <Input label="Slug" value={item.slug} onChange={(v) => updateItem(i, 'slug', v)} placeholder="e.g. dresses" />
          </div>
          <Input label="Description" value={item.description} onChange={(v) => updateItem(i, 'description', v)} placeholder="Short description" />
          <ImageInput label="Image URL" value={item.image_url} onChange={(v) => updateItem(i, 'image_url', v)} bucket="banners" />
        </div>
      ))}
      <button onClick={addItem} className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors">
        + Add Collection
      </button>
    </div>
  );
}

function TestimonialsEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const items = (data.items as Array<{ name: string; text: string; rating: number }>) || [];

  const updateItem = (index: number, field: string, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, items: updated });
  };

  const addItem = () => {
    onChange({ ...data, items: [...items, { name: '', text: '', rating: 5 }] });
  };

  const removeItem = (index: number) => {
    onChange({ ...data, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="p-4 border border-gray-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Testimonial {i + 1}</span>
            <button onClick={() => removeItem(i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
          </div>
          <Input label="Name" value={item.name} onChange={(v) => updateItem(i, 'name', v)} />
          <Textarea label="Text" value={item.text} onChange={(v) => updateItem(i, 'text', v)} rows={2} />
          <div className="w-24">
            <Input label="Rating" value={String(item.rating)} onChange={(v) => updateItem(i, 'rating', parseInt(v) || 5)} />
          </div>
        </div>
      ))}
      <button onClick={addItem} className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors">
        + Add Testimonial
      </button>
    </div>
  );
}

function InstagramGalleryEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const items = (data.items as Array<{ image_url: string; link: string; likes: number }>) || [];

  const updateItem = (index: number, field: string, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, items: updated });
  };

  const addItem = () => {
    onChange({ ...data, items: [...items, { image_url: '', link: '#', likes: 0 }] });
  };

  const removeItem = (index: number) => {
    onChange({ ...data, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Add Instagram post images. Hover overlay shows likes count.</p>
      {items.map((item, i) => (
        <div key={i} className="p-4 border border-gray-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Post {i + 1}</span>
            <button onClick={() => removeItem(i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ImageInput label="Image URL" value={item.image_url} onChange={(v) => updateItem(i, 'image_url', v)} bucket="product-images" />
            <Input label="Link" value={item.link} onChange={(v) => updateItem(i, 'link', v)} placeholder="https://instagram.com/p/..." />
            <Input label="Likes" value={String(item.likes)} onChange={(v) => updateItem(i, 'likes', parseInt(v) || 0)} placeholder="234" />
          </div>
        </div>
      ))}
      <button onClick={addItem} className="px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors">
        + Add Post
      </button>
    </div>
  );
}

function ContactPageEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <Input label="Page Title" value={(data.title as string) || ''} onChange={(v) => onChange({ ...data, title: v })} placeholder="Get in Touch" />
      <Textarea label="Subtitle" value={(data.subtitle as string) || ''} onChange={(v) => onChange({ ...data, subtitle: v })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Email" value={(data.email as string) || ''} onChange={(v) => onChange({ ...data, email: v })} placeholder="hello@evora.com" />
        <Input label="Phone" value={(data.phone as string) || ''} onChange={(v) => onChange({ ...data, phone: v })} placeholder="+1 (555) 123-4567" />
      </div>
      <Input label="Address" value={(data.address as string) || ''} onChange={(v) => onChange({ ...data, address: v })} placeholder="123 Fashion Ave, New York, NY 10001" />
    </div>
  );
}

function FaqPageEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const categories = (data.categories as Array<{ title: string; questions: Array<{ q: string; a: string }> }>) || [];

  const updateCategory = (index: number, field: string, value: string) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, categories: updated });
  };

  const addCategory = () => {
    onChange({ ...data, categories: [...categories, { title: '', questions: [{ q: '', a: '' }] }] });
  };

  const removeCategory = (index: number) => {
    onChange({ ...data, categories: categories.filter((_: unknown, i: number) => i !== index) });
  };

  const updateQuestion = (catIndex: number, qIndex: number, field: string, value: string) => {
    const updated = [...categories];
    updated[catIndex] = {
      ...updated[catIndex],
      questions: updated[catIndex].questions.map((q: { q: string; a: string }, i: number) =>
        i === qIndex ? { ...q, [field]: value } : q
      ),
    };
    onChange({ ...data, categories: updated });
  };

  const addQuestion = (catIndex: number) => {
    const updated = [...categories];
    updated[catIndex] = {
      ...updated[catIndex],
      questions: [...updated[catIndex].questions, { q: '', a: '' }],
    };
    onChange({ ...data, categories: updated });
  };

  const removeQuestion = (catIndex: number, qIndex: number) => {
    const updated = [...categories];
    updated[catIndex] = {
      ...updated[catIndex],
      questions: updated[catIndex].questions.filter((_: unknown, i: number) => i !== qIndex),
    };
    onChange({ ...data, categories: updated });
  };

  return (
    <div className="space-y-4">
      <Input label="Page Title" value={(data.title as string) || ''} onChange={(v) => onChange({ ...data, title: v })} placeholder="Frequently Asked Questions" />
      <Textarea label="Subtitle" value={(data.subtitle as string) || ''} onChange={(v) => onChange({ ...data, subtitle: v })} />

      <div className="border-t border-gray-200 pt-4 mt-4">
        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">FAQ Categories & Questions</h4>
        {categories.map((cat, ci) => (
          <div key={ci} className="p-4 border border-gray-200 rounded-lg space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <Input label={`Category ${ci + 1} Title`} value={cat.title} onChange={(v) => updateCategory(ci, 'title', v)} />
              <button onClick={() => removeCategory(ci)} className="text-xs text-red-500 hover:text-red-700 ml-2 mt-5">Remove</button>
            </div>
            {cat.questions.map((item, qi) => (
              <div key={qi} className="pl-4 border-l-2 border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Q{qi + 1}</span>
                  <button onClick={() => removeQuestion(ci, qi)} className="text-xs text-red-400 hover:text-red-600">x</button>
                </div>
                <Input label="Question" value={item.q} onChange={(v) => updateQuestion(ci, qi, 'q', v)} />
                <Textarea label="Answer" value={item.a} onChange={(v) => updateQuestion(ci, qi, 'a', v)} rows={2} />
              </div>
            ))}
            <button onClick={() => addQuestion(ci)} className="w-full py-1.5 border border-dashed border-gray-300 rounded text-xs text-gray-500 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors">
              + Add Question
            </button>
          </div>
        ))}
        <button onClick={addCategory} className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors">
          + Add Category
        </button>
      </div>
    </div>
  );
}

function ShippingPageEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const sections = (data.sections as Array<{ title: string; content: string }>) || [];

  const updateSection = (index: number, field: string, value: string) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, sections: updated });
  };

  const addSection = () => {
    onChange({ ...data, sections: [...sections, { title: '', content: '' }] });
  };

  const removeSection = (index: number) => {
    onChange({ ...data, sections: sections.filter((_: unknown, i: number) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <Input label="Page Title" value={(data.title as string) || ''} onChange={(v) => onChange({ ...data, title: v })} placeholder="Shipping & Delivery" />
      <Input label="Last Updated" value={(data.last_updated as string) || ''} onChange={(v) => onChange({ ...data, last_updated: v })} placeholder="December 2024" />

      <div className="border-t border-gray-200 pt-4 mt-4">
        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Content Sections</h4>
        {sections.map((section, i) => (
          <div key={i} className="p-4 border border-gray-200 rounded-lg space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <Input label={`Section ${i + 1} Title`} value={section.title} onChange={(v) => updateSection(i, 'title', v)} />
              <button onClick={() => removeSection(i)} className="text-xs text-red-500 hover:text-red-700 ml-2 mt-5">Remove</button>
            </div>
            <Textarea label="Content" value={section.content} onChange={(v) => updateSection(i, 'content', v)} rows={4} />
          </div>
        ))}
        <button onClick={addSection} className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors">
          + Add Section
        </button>
      </div>
    </div>
  );
}

function ReturnsPageEditor({ data, onChange }: { data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }) {
  const sections = (data.sections as Array<{ title: string; content: string }>) || [];

  const updateSection = (index: number, field: string, value: string) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, sections: updated });
  };

  const addSection = () => {
    onChange({ ...data, sections: [...sections, { title: '', content: '' }] });
  };

  const removeSection = (index: number) => {
    onChange({ ...data, sections: sections.filter((_: unknown, i: number) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <Input label="Page Title" value={(data.title as string) || ''} onChange={(v) => onChange({ ...data, title: v })} placeholder="Returns & Exchanges" />
      <Input label="Last Updated" value={(data.last_updated as string) || ''} onChange={(v) => onChange({ ...data, last_updated: v })} placeholder="December 2024" />

      <div className="border-t border-gray-200 pt-4 mt-4">
        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Content Sections</h4>
        {sections.map((section, i) => (
          <div key={i} className="p-4 border border-gray-200 rounded-lg space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <Input label={`Section ${i + 1} Title`} value={section.title} onChange={(v) => updateSection(i, 'title', v)} />
              <button onClick={() => removeSection(i)} className="text-xs text-red-500 hover:text-red-700 ml-2 mt-5">Remove</button>
            </div>
            <Textarea label="Content" value={section.content} onChange={(v) => updateSection(i, 'content', v)} rows={4} />
          </div>
        ))}
        <button onClick={addSection} className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors">
          + Add Section
        </button>
      </div>
    </div>
  );
}

const editors: Record<string, React.ComponentType<{ data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }>> = {
  flash_sale: FlashSaleEditor,
  hero: HeroEditor,
  sale_banner: SaleBannerEditor,
  featured_collections: FeaturedCollectionsEditor,
  seasonal: SeasonalEditor,
  about: AboutEditor,
  testimonials: TestimonialsEditor,
  instagram_gallery: InstagramGalleryEditor,
  page_contact: ContactPageEditor,
  page_faq: FaqPageEditor,
  page_shipping: ShippingPageEditor,
  page_returns: ReturnsPageEditor,
};

export default function ContentPage() {
  const [sections, setSections] = React.useState<SectionData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('hero');
  const [editData, setEditData] = React.useState<Record<string, unknown>>({});
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const raw = await getSiteContent();
        const typed = raw as SectionData[];
        if (!cancelled) {
          setSections(typed);
          const hero = typed.find((s) => s.section_key === 'hero');
          if (hero) setEditData(hero.content);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  const switchTab = (key: string) => {
    setActiveTab(key);
    const section = sections.find((s) => s.section_key === key);
    setEditData(section?.content || {});
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateSiteSection(activeTab, editData);
      setSections((prev) => prev.map((s) => s.section_key === activeTab ? { ...s, content: editData } : s));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />)}</div>;

  const Editor = editors[activeTab];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0A0A0A]">Content Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage homepage sections and promotional content</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {Object.entries(sectionLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => switchTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-[#C9A84C] text-[#C9A84C]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#0A0A0A]">{sectionLabels[activeTab]}</h3>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-white rounded-lg text-sm font-medium hover:bg-[#B8963E] transition-colors disabled:opacity-50"
          >
            {saved ? <CheckCircle className="size-4" /> : <Save className="size-4" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
        {Editor && <Editor data={editData} onChange={setEditData} />}
      </div>
    </div>
  );
}
'use client'

import Link from 'next/link'
import { useState } from 'react'

import { CloudinaryAssetPicker } from '~/components/admin-cloudinary-asset-picker'
import type { Project } from '~/lib/projects'

type ProofRow = { label: string; value: string }
type DecisionRow = { title: string; body: string }

type CaseStudyRecord = {
  heroImagePublicId: string | null
  heroImageAlt: string
  framing: string
  challenge: string
  ownership: string[]
  proof: ProofRow[]
  decisions: DecisionRow[]
  evidence: string[]
  boundary: string
  status: 'draft' | 'published'
}

type FormState = Omit<CaseStudyRecord, 'ownership' | 'evidence'> & {
  ownershipText: string
  evidenceText: string
}

function emptyForm(): FormState {
  return {
    heroImagePublicId: null,
    heroImageAlt: '',
    framing: '',
    challenge: '',
    ownershipText: '',
    proof: [{ label: '', value: '' }],
    decisions: [{ title: '', body: '' }],
    evidenceText: '',
    boundary: '',
    status: 'draft',
  }
}

function formFromRecord(record: CaseStudyRecord | null): FormState {
  if (!record) return emptyForm()
  return {
    heroImagePublicId: record.heroImagePublicId,
    heroImageAlt: record.heroImageAlt,
    framing: record.framing,
    challenge: record.challenge,
    ownershipText: record.ownership.join('\n'),
    proof: record.proof.length ? record.proof : [{ label: '', value: '' }],
    decisions: record.decisions.length ? record.decisions : [{ title: '', body: '' }],
    evidenceText: record.evidence.join('\n'),
    boundary: record.boundary,
    status: record.status,
  }
}

function lines(value: string) {
  return value.split('\n').map((item) => item.trim()).filter(Boolean)
}

export function ProjectEditor({ project, initialRecord }: { project: Project; initialRecord: CaseStudyRecord | null }) {
  const [form, setForm] = useState(() => formFromRecord(initialRecord))
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function updateProof(index: number, field: keyof ProofRow, value: string) {
    setForm((current) => ({
      ...current,
      proof: current.proof.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row),
    }))
  }

  function updateDecision(index: number, field: keyof DecisionRow, value: string) {
    setForm((current) => ({
      ...current,
      decisions: current.decisions.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row),
    }))
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch(`/api/admin/projects/${project.id}/case-study`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          heroImagePublicId: form.heroImagePublicId,
          heroImageAlt: form.heroImageAlt,
          framing: form.framing,
          challenge: form.challenge,
          ownership: lines(form.ownershipText),
          proof: form.proof.filter((row) => row.label.trim() && row.value.trim()),
          decisions: form.decisions.filter((row) => row.title.trim() && row.body.trim()),
          evidence: lines(form.evidenceText),
          boundary: form.boundary,
          status: form.status,
        }),
      })
      if (!response.ok) throw new Error(response.status === 400 ? 'Complete each evidence section before saving.' : 'Project case study could not be saved.')
      setMessage('Saved to Neon.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Project case study could not be saved.')
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!window.confirm(`Delete the case study for ${project.nameEn}?`)) return
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch(`/api/admin/projects/${project.id}/case-study`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Case study could not be deleted.')
      setForm(emptyForm())
      setMessage('Deleted from Neon.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Case study could not be deleted.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-editor pb-10">
      <div className="admin-editor-header">
        <div>
          <Link href="/admin/projects" className="admin-back-link">← Project register</Link>
          <p className="page-eyebrow mt-5">Project case study</p>
          <h1 className="mt-3 text-2xl font-medium tracking-tight">{project.nameEn}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{project.descriptionEn ?? project.description}</p>
        </div>
        <Link href={`/en/projects/${project.id}`} target="_blank" className="admin-secondary-button">View public page ↗</Link>
      </div>

      <form onSubmit={save} className="admin-editor-form">
        <section className="admin-form-section">
          <div className="admin-form-section-heading"><span>01</span><h2>Lead asset</h2></div>
          <CloudinaryAssetPicker
            value={form.heroImagePublicId}
            onChange={(value) => setField('heroImagePublicId', value)}
            label="Project image"
            help="Upload or select an image here. It is saved as a Cloudinary media record and linked by public ID in this case study."
          />
          <input value={form.heroImageAlt} onChange={(event) => setField('heroImageAlt', event.target.value)} placeholder="Image alt text" className="admin-text-input" />
        </section>

        <section className="admin-form-section">
          <div className="admin-form-section-heading"><span>02</span><h2>Case framing</h2></div>
          <label className="admin-form-label">The one-sentence frame<textarea required value={form.framing} onChange={(event) => setField('framing', event.target.value)} rows={4} className="admin-textarea" /></label>
          <label className="admin-form-label">The hard problem<textarea required value={form.challenge} onChange={(event) => setField('challenge', event.target.value)} rows={5} className="admin-textarea" /></label>
        </section>

        <section className="admin-form-section">
          <div className="admin-form-section-heading"><span>03</span><h2>Ownership and proof</h2></div>
          <label className="admin-form-label">What I owned <span className="admin-form-hint">One item per line</span><textarea required value={form.ownershipText} onChange={(event) => setField('ownershipText', event.target.value)} rows={6} className="admin-textarea" /></label>
          <div className="admin-form-label">Proof points <span className="admin-form-hint">Short label + measurable or observable value</span>
            <div className="admin-repeat-list">
              {form.proof.map((row, index) => (
                <div key={index} className="admin-repeat-row">
                  <input value={row.label} onChange={(event) => updateProof(index, 'label', event.target.value)} placeholder="Label" className="admin-text-input" />
                  <input value={row.value} onChange={(event) => updateProof(index, 'value', event.target.value)} placeholder="Value" className="admin-text-input" />
                  <button type="button" className="admin-remove-button" onClick={() => setField('proof', form.proof.filter((_, rowIndex) => rowIndex !== index))}>Remove</button>
                </div>
              ))}
            </div>
            <button type="button" className="admin-add-button" onClick={() => setField('proof', [...form.proof, { label: '', value: '' }])}>+ Add proof point</button>
          </div>
        </section>

        <section className="admin-form-section">
          <div className="admin-form-section-heading"><span>04</span><h2>Decisions</h2></div>
          <div className="admin-repeat-list">
            {form.decisions.map((row, index) => (
              <article key={index} className="admin-repeat-card">
                <div className="admin-repeat-card-header"><span>Decision {String(index + 1).padStart(2, '0')}</span><button type="button" className="admin-remove-button" onClick={() => setField('decisions', form.decisions.filter((_, rowIndex) => rowIndex !== index))}>Remove</button></div>
                <input value={row.title} onChange={(event) => updateDecision(index, 'title', event.target.value)} placeholder="Decision title" className="admin-text-input" />
                <textarea value={row.body} onChange={(event) => updateDecision(index, 'body', event.target.value)} placeholder="Why this decision mattered" rows={4} className="admin-textarea" />
              </article>
            ))}
          </div>
          <button type="button" className="admin-add-button" onClick={() => setField('decisions', [...form.decisions, { title: '', body: '' }])}>+ Add decision</button>
        </section>

        <section className="admin-form-section">
          <div className="admin-form-section-heading"><span>05</span><h2>Evidence boundary</h2></div>
          <label className="admin-form-label">Evidence of the result <span className="admin-form-hint">One item per line</span><textarea required value={form.evidenceText} onChange={(event) => setField('evidenceText', event.target.value)} rows={6} className="admin-textarea" /></label>
          <label className="admin-form-label">Boundary / honesty note<textarea required value={form.boundary} onChange={(event) => setField('boundary', event.target.value)} rows={4} className="admin-textarea" /></label>
        </section>

        <div className="admin-editor-actions">
          <select value={form.status} onChange={(event) => setField('status', event.target.value as FormState['status'])} className="admin-select">
            <option value="draft">Save as draft</option>
            <option value="published">Publish to public page</option>
          </select>
          <button type="submit" disabled={busy} className="admin-primary-button">{busy ? 'Saving…' : 'Save case study'}</button>
          {initialRecord ? <button type="button" disabled={busy} onClick={() => void remove()} className="admin-danger-button">Delete</button> : null}
        </div>
        {message ? <p className="admin-form-message" role="status">{message}</p> : null}
      </form>
    </div>
  )
}

/**
 * pas-enrollment-adapter
 *
 * Mock PAS (Policy Administration System) adapter for enrollment processing.
 * Acts as the middleware between the web app and a real PAS like OIPA.
 *
 * In production, replace the mock rules section with a real OIPA API call.
 * The request/response contract stays identical — the frontend never changes.
 *
 * POST /functions/v1/pas-enrollment-adapter
 * Body: EnrollmentRequest
 * Returns: EnrollmentResult
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ─── Types ────────────────────────────────────────────────────────────────────

interface EnrollmentRequest {
  employee_id:    string
  sponsor_id:     string
  plan_id:        string
  form_data:      Record<string, unknown>  // raw form field values keyed by field ID
  submitted_by:   string                   // user_id or persona label
}

type PasStatus =
  | 'ENROLLED'         // accepted, member record created
  | 'PENDING_REVIEW'   // accepted but needs manual underwriter review
  | 'PENDING_EOI'      // requires Evidence of Insurability before activation
  | 'INELIGIBLE'       // rejected — does not meet plan eligibility rules
  | 'ERROR'            // PAS system error — retry or escalate

interface EnrollmentResult {
  status:          PasStatus
  member_number?:  string           // set when ENROLLED
  reason?:         string           // human-readable explanation for non-ENROLLED
  pas_ref?:        string           // PAS transaction reference (mock: generated UUID prefix)
  mock:            boolean          // always true in this adapter; false in real OIPA
}

// ─── Mock PAS rules ───────────────────────────────────────────────────────────
// Replace this function body with a real OIPA API call in production.
// Keep the function signature identical.

function evaluateMockPasRules(
  request: EnrollmentRequest,
  employeeRecord: Record<string, unknown>,
): EnrollmentResult {
  const { form_data } = request
  const pasRef = `MOCK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`

  // ── Rule 1: Salary above $500,000 → manual underwriting required ─────────
  const salary = Number(employeeRecord.annual_salary ?? 0)
  if (salary > 500_000) {
    return {
      status: 'PENDING_REVIEW',
      reason: `Annual salary of $${salary.toLocaleString()} exceeds the non-evidence maximum. Forwarded to underwriting for manual review.`,
      pas_ref: pasRef,
      mock: true,
    }
  }

  // ── Rule 2: Age 65+ → ineligible ──────────────────────────────────────────
  const dob = form_data.date_of_birth as string | undefined
  if (dob) {
    const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    if (age >= 65) {
      return {
        status: 'INELIGIBLE',
        reason: `Applicant age ${age} exceeds maximum eligible age of 64 under this plan.`,
        pas_ref: pasRef,
        mock: true,
      }
    }
  }

  // ── Rule 3: Family coverage tier → Evidence of Insurability required ──────
  const coverageTier = form_data.coverage_tier as string | undefined
  if (coverageTier === 'Family') {
    return {
      status: 'PENDING_EOI',
      reason: 'Family coverage requires Evidence of Insurability for all dependants. Please submit EOI documentation.',
      pas_ref: pasRef,
      mock: true,
    }
  }

  // ── Rule 4: Quebec province → pending review (provincial compliance check) ─
  const province = (form_data.province ?? employeeRecord.province_state_code) as string | undefined
  if (province === 'QC') {
    return {
      status: 'PENDING_REVIEW',
      reason: 'Quebec enrollments require additional provincial compliance verification.',
      pas_ref: pasRef,
      mock: true,
    }
  }

  // ── Rule 5: Simulate random PAS error (~5% of submissions) ───────────────
  if (Math.random() < 0.05) {
    return {
      status: 'ERROR',
      reason: 'PAS system returned an unexpected error (ERR-5032). Please retry or contact support.',
      pas_ref: pasRef,
      mock: true,
    }
  }

  // ── Default: approved ─────────────────────────────────────────────────────
  const memberNumber = `MBR-${Date.now().toString().slice(-6)}`
  return {
    status:        'ENROLLED',
    member_number: memberNumber,
    pas_ref:       pasRef,
    mock:          true,
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const body: EnrollmentRequest = await req.json()
    const { employee_id, sponsor_id, plan_id, form_data, submitted_by } = body

    if (!employee_id || !sponsor_id || !plan_id) {
      return Response.json({ error: 'employee_id, sponsor_id, and plan_id are required' }, { status: 400 })
    }

    // ── Init Supabase admin client ─────────────────────────────────────────
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // ── Fetch employee record for rule evaluation ──────────────────────────
    const { data: employee, error: empErr } = await supabase
      .from('employee')
      .select('employee_id, first_name, last_name, annual_salary, province_state_code, date_of_birth')
      .eq('employee_id', employee_id)
      .single()

    if (empErr || !employee) {
      return Response.json({ error: 'Employee not found' }, { status: 404 })
    }

    // ── Evaluate mock PAS rules ────────────────────────────────────────────
    // TODO: replace evaluateMockPasRules() with real OIPA API call:
    //   const oipaResult = await callOipa({ employee, form_data, plan_id })
    //   const result = mapOipaResponse(oipaResult)
    const result = evaluateMockPasRules(body, employee)

    // ── Persist the enrollment transaction ────────────────────────────────
    // Always write the submission + PAS result, regardless of status.
    // This creates an audit trail and allows re-processing PENDING/ERROR cases.
    const { error: txErr } = await supabase
      .from('enrollment_transaction')
      .insert({
        employee_id,
        sponsor_id,
        plan_id,
        submitted_by,
        form_data,
        pas_status:  result.status,
        pas_ref:     result.pas_ref,
        pas_reason:  result.reason ?? null,
        mock:        result.mock,
      })

    if (txErr) {
      console.error('Failed to write enrollment_transaction:', txErr.message)
      // Non-fatal: return the PAS result anyway; the transaction can be retried
    }

    // ── If ENROLLED: create the member record ─────────────────────────────
    if (result.status === 'ENROLLED' && result.member_number) {
      const { error: memberErr } = await supabase
        .from('member')
        .insert({
          employee_id,
          plan_id,
          member_number:  result.member_number,
          member_status:  'ACTIVE',
          effective_date: new Date().toISOString().split('T')[0],
        })

      if (memberErr) {
        console.error('Failed to create member record:', memberErr.message)
        // Return error so the frontend knows the DB write failed
        return Response.json(
          { error: 'Enrollment approved by PAS but member record creation failed. Please contact support.', pas_ref: result.pas_ref },
          { status: 500 },
        )
      }
    }

    return Response.json(result, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    })

  } catch (err) {
    console.error('pas-enrollment-adapter error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
})

CREATE UNIQUE INDEX applications_active_student_offer
  ON applications (offer_id, student_id)
  WHERE status = 'IN_PROGRESS';

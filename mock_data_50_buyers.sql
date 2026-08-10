-- Mock data: 50 buyers with varying entries (5-20 entries each)
-- For draw: 16/7/2026

DO $$
DECLARE
  draw_id_var UUID;
  buyer_id_var UUID;
  buyer_names TEXT[] := ARRAY[
    'สมชาย', 'สมหญิง', 'วินัย', 'ประภา', 'สุภาพ',
    'นภา', 'วิชัย', 'สุดา', 'มานะ', 'รัตนา',
    'ปรีชา', 'สมศรี', 'เจริญ', 'วันดี', 'ธนา',
    'พิมพ์', 'สุเมธ', 'ลักษณา', 'บุญมี', 'สายัณห์',
    'ณัฐ', 'กมล', 'พัชรี', 'อรุณ', 'จิรา',
    'ศิริ', 'ปราณี', 'อนุชา', 'วาสนา', 'เกรียง',
    'นิตยา', 'สุวิทย์', 'ปัทมา', 'วีระ', 'อัญชลี',
    'ธีระ', 'สุนีย์', 'ประสิทธิ์', 'วรรณา', 'สมพร',
    'นพพร', 'ชัยวัฒน์', 'ภาวิณี', 'กฤษฎา', 'สุภาวดี',
    'อดิศักดิ์', 'ปิยะ', 'นวพร', 'กัลยา', 'ไพโรจน์'
  ];
  entry_counts INT[] := ARRAY[20,18,15,12,20,8,14,19,10,17,11,20,9,13,16,7,20,14,12,18,
                              15,11,20,13,16,9,19,12,15,20,14,17,10,20,13,16,11,18,14,20,
                              12,19,15,13,20,16,14,18,11,17];
  numbers TEXT[] := ARRAY['01','02','03','04','05','07','08','09','11','12','13','14','15',
                         '16','17','18','19','20','21','23','24','25','26','27','28','29',
                         '32','33','34','35','36','37','38','39','41','42','43','44','45',
                         '46','47','48','49','51','52','53','54','55','56','57','58','59',
                         '61','62','63','64','65','66','67','68','69','71','72','73','74',
                         '75','76','77','78','79','81','82','83','84','85','86','87','88',
                         '89','91','92','93','94','95','96','97','98','99',
                         '100','101','102','103','104','105','106','107','108','109',
                         '111','112','113','114','115','116','117','118','119',
                         '123','124','125','126','127','128','129',
                         '234','235','236','237','238','239',
                         '345','346','347','348','349',
                         '456','457','458','459',
                         '567','568','569',
                         '678','679','689',
                         '789','790','791',
                         '890','891','892',
                         '901','902','903'];
  bet_types TEXT[] := ARRAY['บน','ล่าง'];
  amounts TEXT[] := ARRAY['50','100','150','200','50x50','100x100','50x100','100x50x50'];
  reverse_modes TEXT[] := ARRAY[NULL, NULL, NULL, 'หมุนหน้า', 'หมุนท้าย'];
  i INT;
  j INT;
  entry_count INT;
  random_num TEXT;
  random_bet TEXT;
  random_amount TEXT;
  random_reverse TEXT;
BEGIN
  -- Get draw_id for 16/7/2026
  SELECT id INTO draw_id_var FROM draws WHERE draw_date = '16/7/2026';

  IF draw_id_var IS NULL THEN
    RAISE EXCEPTION 'Draw 16/7/2026 not found';
  END IF;

  -- Loop through 50 buyers
  FOR i IN 1..50 LOOP
    -- Insert or get buyer
    INSERT INTO buyers (id, name, created_at)
    VALUES (gen_random_uuid(), buyer_names[i], NOW())
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO buyer_id_var;

    -- Get entry count for this buyer
    entry_count := entry_counts[i];

    -- Insert entries for this buyer
    FOR j IN 1..entry_count LOOP
      random_num := numbers[1 + floor(random() * array_length(numbers, 1))::int];
      random_bet := bet_types[1 + floor(random() * 2)::int];
      random_amount := amounts[1 + floor(random() * array_length(amounts, 1))::int];

      -- Reverse mode only for 3-digit + ล่าง
      IF length(random_num) = 3 AND random_bet = 'ล่าง' THEN
        random_reverse := reverse_modes[1 + floor(random() * array_length(reverse_modes, 1))::int];
      ELSE
        random_reverse := NULL;
      END IF;

      -- Floating numbers (1-digit)
      IF length(random_num) = 1 THEN
        IF random_bet = 'บน' THEN
          random_bet := 'ลอยบน';
        ELSE
          random_bet := 'ลอยล่าง';
        END IF;
        random_amount := amounts[1 + floor(random() * 4)::int]; -- Simple amounts only
        random_reverse := NULL;
      END IF;

      INSERT INTO entries (id, buyer_id, draw_id, number, bet_type, amount, reverse_mode, created_at)
      VALUES (
        gen_random_uuid(),
        buyer_id_var,
        draw_id_var,
        random_num,
        random_bet,
        random_amount,
        random_reverse,
        NOW()
      );
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Successfully inserted 50 buyers with % total entries', (SELECT SUM(x) FROM unnest(entry_counts) x);
END $$;

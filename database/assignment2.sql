

#ITEM 1

INSERT INTO public.account(
	account_firstname,
	account_lastname,
	account_email,
    account_password 
)
VALUES
(
	'Tony',
	'Stark',
	'tony@starkent.com',
	'Iam1ronM@n'
);

#ITEM 2

UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

#ITEM 3

DELETE FROM public.account
WHERE account_email = 'tony@starkent.com';

#ITEM 4

UPDATE public.inventory
SET inv_description =
REPLACE(inv_description, 'the small interiors', 'a huge interior')
WHERE inv_id = 10;

#ITEM 5

SELECT inv_make, inv_model
FROM inventory i
INNER JOIN classification c
ON c.classification_id = i.classification_id
WHERE c.classification_name = 'Sport';

#ITEM 6

UPDATE public.inventory
SET inv_image =
REPLACE(inv_image, '/images/', '/images/vehicles/') ,
inv_thumbnail =
REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');

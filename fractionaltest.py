import numpy as np

n = 10000

for i in range(1, n+1):
	a_i = n*(2)**(0.5)
	fractional_part = a_i - np.floor(a_i)
	if fractional_part < 1.0/i:
		print(i)
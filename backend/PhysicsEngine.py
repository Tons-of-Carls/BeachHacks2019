import random
from scipy.stats import norm
from bottle import route, run, request, response
#example of electron (hydrogen) in stern-gerlach experiment

m_e = 9.10938291E-31
q_e = 1.60217662E-19
h_bar = 6.62607015E-34
u = 1.66054E-27
k_b = 1.38064852E-23
TPF = 0.000004

e = {"g": 2, "q": -q_e, "m": m_e, "s": 0.5}
hydrogen = {'M': (1.00794 * u), 'valence': e}
atomBook = {"hydrogen": hydrogen}
def get_y_velocity():
    y_velocity = norm.rvs(loc=0, scale=1)
    return y_velocity


def get_x_velocity(T, L, atom):
    '''
    this gets average velocity (not even in x, y-axis), so need to fix

    '''
    x_velocity_avg = ((3 * T * k_b)/(atom['M'])) ** (1/2)
    time = L/x_velocity_avg
    return x_velocity_avg

def getTime(T, L, atom):
    x_velocity = get_x_velocity(T, L, atom)
    time = L / x_velocity
    return time


def intrinsicDipoleMomentum(particle):
    g, q, m, s = particle["g"], particle["q"], particle["m"], particle["s"]
    m_s = []
    negative_s = -s
    while s >= negative_s:
        m_s.append(s)
        s -= 1
    random_m_s = random.choice(m_s)

    momentum = -g * (q/(2*m))* random_m_s * h_bar
    return momentum


def get_z_Force(particle, magnetic_gradient):
    momentum = intrinsicDipoleMomentum(particle)
    force = momentum * magnetic_gradient
    return force


def get_z_Acceleration(atom, magnetic_gradient):
    M = atom['M']
    particle = atom['valence']
    acceleration = get_z_Force(particle, magnetic_gradient)/M
    return acceleration


def get_z_Distance(T, L, atom, magnetic_gradient):
    acceleration = get_z_Acceleration(atom, magnetic_gradient)
    time = getTime(T, L, atom)
    distance = (1/2) * acceleration * time ** 2
    return distance

def position(T, L, atom, magnetic_gradient):
    x_velocity = get_x_velocity(T, L, atom)
    y_velocity = get_y_velocity()
    z_acceleration = get_z_Acceleration(atom, magnetic_gradient)
    endTime = getTime(T, L, atom)
    position = []
    times = [TPF * i for i in range(int(endTime//TPF) + 1)]
    times.append(endTime)
    for i in times:
        x_distance = x_velocity * i
        y_distance = y_velocity * i
        z_distance = (1/2) * z_acceleration * i**2
        position.append([x_distance, y_distance, z_distance])
    return position

def many_particles(T, L, atom, magnetic_gradient, big_num):
    atom = atomBook[atom]
    particle_dict = {}
    for i in range(big_num):
        particle_dict[i] = position(T, L, atom, magnetic_gradient)
    return particle_dict

@route('/stern_gerlach_experiment')
def index():
    print(request.body)




run(host='localhost', port=8080)




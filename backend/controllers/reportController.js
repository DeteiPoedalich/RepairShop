const { RepairOrder, Client, Device, Service, OrderService, OrderStatus } = require('../models');
const { Op } = require('sequelize');

exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    const where = {};
    
    if (startDate && endDate) {
      where.date_created = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    if (status) {
      where.id_status = status;
    }

    const orders = await RepairOrder.findAll({
      where,
      include: [
        { model: Client },
        { model: Device },
        { model: OrderStatus },
        { 
          model: Service, 
          as: 'services',
          through: { attributes: ['quantity', 'price'] }
        }
      ],
      order: [['date_created', 'DESC']]
    });

    // Формируем отчет
    const report = {
      period: {
        startDate: startDate || 'начало',
        endDate: endDate || 'конец'
      },
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.final_cost || 0), 0),
      ordersByStatus: {},
      popularServices: {},
      revenueByMonth: {}
    };

    // Аналитика по статусам
    orders.forEach(order => {
      const statusName = order.OrderStatus.name;
      if (!report.ordersByStatus[statusName]) {
        report.ordersByStatus[statusName] = 0;
      }
      report.ordersByStatus[statusName]++;
    });

    // Популярные услуги
    orders.forEach(order => {
      order.services.forEach(service => {
        const serviceName = service.name;
        if (!report.popularServices[serviceName]) {
          report.popularServices[serviceName] = {
            count: 0,
            revenue: 0
          };
        }
        report.popularServices[serviceName].count++;
        report.popularServices[serviceName].revenue += 
          parseFloat(service.OrderService.price || service.price) * 
          (service.OrderService.quantity || 1);
      });
    });

    // Выручка по месяцам
    orders.forEach(order => {
      const month = order.date_created.toISOString().substring(0, 7); // YYYY-MM
      if (!report.revenueByMonth[month]) {
        report.revenueByMonth[month] = 0;
      }
      report.revenueByMonth[month] += parseFloat(order.final_cost || 0);
    });

    res.json(report);
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({ error: 'Ошибка при формировании отчета' });
  }
};

exports.getMasterReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {
      id_status: { [Op.in]: [4, 5, 6] } // В ремонте, Готов, Выдан
    };
    
    if (startDate && endDate) {
      where.date_created = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const orders = await RepairOrder.findAll({
      where,
      include: [
        { model: Client },
        { model: Device },
        { model: OrderStatus },
        { 
          model: 'master', 
          attributes: ['id_user', 'name']
        }
      ]
    });

    const masterStats = {};

    orders.forEach(order => {
      const masterId = order.id_master;
      const masterName = order.master?.name || 'Не назначен';
      
      if (!masterStats[masterId]) {
        masterStats[masterId] = {
          masterName,
          totalOrders: 0,
          completedOrders: 0,
          totalRevenue: 0,
          averageCompletionTime: 0
        };
      }

      masterStats[masterId].totalOrders++;
      
      if (order.id_status === 5 || order.id_status === 6) { // Готов или Выдан
        masterStats[masterId].completedOrders++;
      }

      masterStats[masterId].totalRevenue += parseFloat(order.final_cost || 0);

      // Расчет среднего времени выполнения
      if (order.date_completed) {
        const completionTime = new Date(order.date_completed) - new Date(order.date_created);
        masterStats[masterId].averageCompletionTime += completionTime;
      }
    });

    // Преобразуем в массив и рассчитываем среднее время
    const result = Object.values(masterStats).map(stat => ({
      ...stat,
      averageCompletionTime: stat.completedOrders > 0 
        ? Math.round(stat.averageCompletionTime / stat.completedOrders / (1000 * 60 * 60 * 24)) 
        : 0, // в днях
      completionRate: stat.totalOrders > 0 
        ? (stat.completedOrders / stat.totalOrders * 100).toFixed(1) 
        : 0
    }));

    res.json(result);
  } catch (error) {
    console.error('Get master report error:', error);
    res.status(500).json({ error: 'Ошибка при формировании отчета по мастерам' });
  }
};

exports.getDeviceTypeReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    
    if (startDate && endDate) {
      where.date_created = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const orders = await RepairOrder.findAll({
      where,
      include: [
        { 
          model: Device,
          include: ['DeviceType']
        },
        { model: OrderStatus }
      ]
    });

    const deviceTypeStats = {};

    orders.forEach(order => {
      const deviceType = order.Device?.DeviceType;
      if (!deviceType) return;

      const typeId = deviceType.id_type;
      const typeName = deviceType.name;

      if (!deviceTypeStats[typeId]) {
        deviceTypeStats[typeId] = {
          typeName,
          totalOrders: 0,
          completedOrders: 0,
          totalRevenue: 0,
          commonProblems: {}
        };
      }

      deviceTypeStats[typeId].totalOrders++;
      
      if (order.id_status === 5 || order.id_status === 6) {
        deviceTypeStats[typeId].completedOrders++;
      }

      deviceTypeStats[typeId].totalRevenue += parseFloat(order.final_cost || 0);

      // Анализ распространенных проблем
      if (order.problem_description) {
        const problems = order.problem_description.toLowerCase().split(/[.,!?;]/);
        problems.forEach(problem => {
          problem = problem.trim();
          if (problem.length > 3) {
            if (!deviceTypeStats[typeId].commonProblems[problem]) {
              deviceTypeStats[typeId].commonProblems[problem] = 0;
            }
            deviceTypeStats[typeId].commonProblems[problem]++;
          }
        });
      }
    });

    // Сортируем проблемы по частоте
    Object.keys(deviceTypeStats).forEach(typeId => {
      const problems = deviceTypeStats[typeId].commonProblems;
      const sortedProblems = Object.entries(problems)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5) // Топ-5 проблем
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
      
      deviceTypeStats[typeId].commonProblems = sortedProblems;
    });

    res.json(Object.values(deviceTypeStats));
  } catch (error) {
    console.error('Get device type report error:', error);
    res.status(500).json({ error: 'Ошибка при формировании отчета по типам устройств' });
  }
};